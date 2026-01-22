from splitwiz import Splitwise
from .models import Transaction, Ledger, SplitwiseLink, User, Category
from decimal import Decimal
from django.utils import timezone
from datetime import datetime

class SplitwiseService:
    def __init__(self, user):
        self.user = user
        try:
            self.link = user.splitwise_link
            self.client = Splitwise(consumer_key=self.link.api_key, consumer_secret="") 
        except SplitwiseLink.DoesNotExist:
            self.client = None

    def sync_expenses(self):
        if not self.client:
            return {"status": "error", "message": "No Splitwise account linked."}

        try:
            current_user = self.client.getCurrentUser()
            my_splitwise_id = current_user.getId()
            
            expenses = self.client.getExpenses(limit=20)
            
            synced_count = 0
            
            for exp in expenses:
                if Transaction.objects.filter(splitwise_id=str(exp.getId())).exists():
                    continue

                payer_id = None
                for u in exp.getUsers():
                    if u.getPaidShare() > 0:
                        payer_id = u.getId()
                        break
                
                payer_db = self.user if payer_id == my_splitwise_id else None
                
                users_involved = exp.getUsers()
                
                if payer_db is None:
                    paid_user_splitwise = next((u for u in users_involved if u.getId() == payer_id), None)
                    name = paid_user_splitwise.getFirstName() if paid_user_splitwise else "Unknown"
                    payer_db, _ = User.objects.get_or_create(
                        email=f"splitwise_{payer_id}@external.com",
                        defaults={'name': name, 'household_id': 'external'}
                    )

                date_str = exp.getDate() 
                try:
                    dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                except:
                    dt = timezone.now()

                transaction = Transaction.objects.create(
                    description=exp.getDescription(),
                    total_amount=Decimal(exp.getCost()),
                    payer=payer_db,
                    date=dt,
                    splitwise_id=str(exp.getId())
                )

                for u in users_involved:
                    user_share = Decimal(u.getOwedShare())
                    if user_share == 0:
                        continue
                        
                    u_splitwise_id = u.getId()
                    if u_splitwise_id == my_splitwise_id:
                        db_user = self.user
                    else:
                        db_user, _ = User.objects.get_or_create(
                            email=f"splitwise_{u_splitwise_id}@external.com",
                            defaults={'name': u.getFirstName(), 'household_id': 'external'}
                        )
                    
                    if db_user != payer_db:
                        Ledger.objects.create(
                            transaction=transaction,
                            from_user=db_user,
                            to_user=payer_db,
                            amount=user_share,
                            is_settlement=False
                        )
                
                synced_count += 1
            
            return {"status": "success", "synced": synced_count}

        except Exception as e:
            return {"status": "error", "message": str(e)}
