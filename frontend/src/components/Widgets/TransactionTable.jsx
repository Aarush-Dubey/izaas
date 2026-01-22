import React from 'react';

const TransactionTable = ({ data, props }) => {
    return (
        <div className="w-full overflow-hidden bg-white/5 rounded-xl border border-white/10 mt-4 backdrop-blur-sm">
            <table className="w-full text-left">
                <thead className="bg-white/10 text-gray-200 uppercase text-xs">
                    <tr>
                        <th className="px-6 py-3">Description</th>
                        <th className="px-6 py-3 text-right">Amount</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                    {data.map((row) => (
                        <tr key={row.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 font-medium">{row.desc}</td>
                            <td className="px-6 py-4 text-right text-primary font-bold">
                                ${row.amount}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TransactionTable;
