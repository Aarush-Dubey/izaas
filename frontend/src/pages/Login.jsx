import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const { credential } = credentialResponse;
            // Send token to backend to verify and get session/JWT
            const res = await api.post('auth/google/', {
                access_token: credential // Note: google-only flow might return id_token as credential
            });
            // In a real app we might store token here or rely on httpOnly cookie from backend
            console.log('Login success:', res.data);
            navigate('/');
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-background relative overflow-hidden">
            {/* Background Blobs */}
            <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px]" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-special/5 rounded-full blur-[120px]" />

            <div className="relative z-10 w-full max-w-md p-8 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-special bg-clip-text text-transparent mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-gray-400">Sign in to manage your finances</p>
                </div>

                <div className="flex justify-center">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => {
                            console.log('Login Failed');
                        }}
                        useOneTap
                        theme="filled_black"
                        shape="pill"
                    />
                </div>
            </div>
        </div>
    );
};

export default Login;
