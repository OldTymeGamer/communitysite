import mongoose from 'mongoose'

export interface IRedMPlayer extends mongoose.Document {
  playerId: string
  username: string
  money: number
  job: string
  lastSynced: Date
}

const RedMPlayerSchema = new mongoose.Schema<IRedMPlayer>({
  playerId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  money: { type: Number, required: true },
  job: { type: String, required: true },
  lastSynced: { type: Date, default: Date.now }
})

export default mongoose.models.RedMPlayer || mongoose.model<IRedMPlayer>('RedMPlayer', RedMPlayerSchema)
