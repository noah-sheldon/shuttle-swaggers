import { getDb } from '../connection';
import { GuestSignUp } from '@/types';
import { ObjectId } from 'mongodb';

export class GuestModel {
  private static collection = 'guest_signups';

  static async create(guest: Omit<GuestSignUp, '_id'>): Promise<GuestSignUp> {
    const db = await getDb();
    const guestData = { ...guest, created_at: new Date() };
    const result = await db.collection(this.collection).insertOne(guestData);
    return { ...guestData, _id: result.insertedId.toString() };
  }

  static async findBySessionId(sessionId: string): Promise<GuestSignUp[]> {
    const db = await getDb();
    const guests = await db.collection(this.collection)
      .find({ session_id: sessionId })
      .sort({ created_at: -1 })
      .toArray();
    return guests.map(g => ({ ...g, _id: g._id.toString() }));
  }
}