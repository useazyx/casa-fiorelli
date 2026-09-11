import { prisma } from '../config/prisma.js'

interface CreateContactMessageInput {
  name: string
  email: string
  subject?: string
  message: string
}

export class CreateContactMessageService {
  async execute(input: CreateContactMessageInput) {
    const message = await prisma.contactMessage.create({ data: input })

    return { id: message.id, createdAt: message.createdAt }
  }
}
