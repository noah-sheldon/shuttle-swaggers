import { getDb } from '../connection';
import { Session, Player } from '@/types';
import { ObjectId } from 'mongodb';

export class SessionModel {
  private static collection = 'sessions';

  static async create(session: Omit<Session, '_id'>): Promise<Session> {
    const db = await getDb();
    const result = await db.collection(this.collection).insertOne(session);
    return { ...session, _id: result.insertedId.toString() };
  }

  static async findById(id: string): Promise<Session | null> {
    const db = await getDb();
    const session = await db.collection(this.collection).findOne({ _id: new ObjectId(id) });
    if (!session) return null;
    return { ...session, _id: session._id.toString() } as Session;
  }

  static async findUpcoming(): Promise<Session[]> {
    const db = await getDb();
    const sessions = await db.collection(this.collection)
      .find({ 
        date: { $gte: new Date() },
        status: { $ne: 'completed' }
      })
      .sort({ date: 1 })
      .toArray();
    return sessions.map(s => ({ ...s, _id: s._id.toString() } as Session));
  }

  static async findLive(): Promise<Session | null> {
    const db = await getDb();
    const session = await db.collection(this.collection).findOne({ 
      is_live: true,
      status: 'live'
    });
    if (!session) return null;
    return { ...session, _id: session._id.toString() } as Session;
  }

  static async updatePlayerData(sessionId: string, playerData: Player[]): Promise<void> {
    const db = await getDb();
    await db.collection(this.collection).updateOne(
      { _id: new ObjectId(sessionId) },
      { $set: { player_data: playerData } }
    );
  }

  static async addMatch(sessionId: string, match: any): Promise<void> {
    const db = await getDb();
    await db.collection(this.collection).updateOne(
      { _id: new ObjectId(sessionId) },
      { $push: { matches: match } }
    );
  }

  static async updateWaitingQueue(sessionId: string, queue: string[]): Promise<void> {
    const db = await getDb();
    await db.collection(this.collection).updateOne(
      { _id: new ObjectId(sessionId) },
      { $set: { waiting_queue: queue } }
    );
  }

  static async startLiveSession(sessionId: string): Promise<void> {
    const db = await getDb();
    await db.collection(this.collection).updateOne(
      { _id: new ObjectId(sessionId) },
      { 
        $set: { 
          is_live: true,
          status: 'live'
        }
      }
    );
  }

  static async endLiveSession(sessionId: string): Promise<void> {
    const db = await getDb();
    await db.collection(this.collection).updateOne(
      { _id: new ObjectId(sessionId) },
      { 
        $set: { 
          is_live: false,
          status: 'completed',
          completed_at: new Date()
        }
      }
    );
  }

  static async findCompleted(limit: number = 20): Promise<Session[]> {
    const db = await getDb();
    const sessions = await db.collection(this.collection)
      .find({ status: 'completed' })
      .sort({ completed_at: -1 })
      .limit(limit)
      .toArray();
    return sessions.map(s => ({ ...s, _id: s._id.toString() } as Session));
  }

  static async findAll(): Promise<Session[]> {
    const db = await getDb();
    const sessions = await db.collection(this.collection)
      .find({})
      .sort({ date: -1 })
      .toArray();
    return sessions.map(s => ({ ...s, _id: s._id.toString() } as Session));
  }

  static async updateSession(sessionId: string, sessionData: Partial<Session>): Promise<void> {
    const db = await getDb();
    const { _id, ...updateData } = sessionData;
    await db.collection(this.collection).updateOne(
      { _id: new ObjectId(sessionId) },
      { $set: updateData }
    );
  }
}