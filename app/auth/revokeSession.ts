"use server"
import { cookies } from 'next/headers';
import prisma from '@/prisma/prisma';

const RevokeSession = async () => {
    const retrievedCookies = await cookies();
    const token = retrievedCookies.get('session');

    if (!token) return

    await prisma.session.delete({
        where : {
            token : token.value
        }
    })

    retrievedCookies.delete('session')
}

export default RevokeSession