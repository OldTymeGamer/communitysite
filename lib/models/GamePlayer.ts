import mongoose from 'mongoose'

export interface IGamePlayer extends mongoose.Document {
  playerId: string
  username: string
  money: number
  job: string
  lastSynced: Date
}

const GamePlayerSchema = new mongoose.Schema<IGamePlayer>({
  playerId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  money: { type: Number, required: true },
  job: { type: String, required: true },
  lastSynced: { type: Date, default: Date.now }
})

export default mongoose.models.GamePlayer || mongoose.model<IGamePlayer>('GamePlayer', GamePlayerSchema)