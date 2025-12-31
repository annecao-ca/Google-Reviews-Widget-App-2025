export default function handler(req: any, res: any) {
    res.status(200).json({
        status: 'ok',
        message: 'Backend is running perfectly on Vercel!',
        timestamp: new Date().toISOString()
    });
}
