import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  QuerySupportTicketsDto,
  SupportStatsDto,
} from './dto/support.dto';

@Injectable()
export class SupportService {
  constructor(private readonly prisma: PrismaService) {}

  async getSupportStats(): Promise<SupportStatsDto> {
    const [
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      urgentTickets,
    ] = await Promise.all([
      this.prisma.supportTicket.count(),
      this.prisma.supportTicket.count({ where: { status: 'OPEN' } }),
      this.prisma.supportTicket.count({ where: { status: 'IN_PROGRESS' } }),
      this.prisma.supportTicket.count({ where: { status: 'RESOLVED' } }),
      this.prisma.supportTicket.count({ 
        where: { 
          priority: { in: ['HIGH', 'URGENT'] } 
        } 
      }),
    ]);

    // Calculate average response time (simplified - time from creation to first status change)
    const resolvedTicketsWithTime = await this.prisma.supportTicket.findMany({
      where: { status: 'RESOLVED', resolvedAt: { not: null } },
      select: {
        createdAt: true,
        resolvedAt: true,
      },
    });

    let averageResponseTime = 0;
    if (resolvedTicketsWithTime.length > 0) {
      const totalTime = resolvedTicketsWithTime.reduce((sum, ticket) => {
        if (ticket.resolvedAt) {
          return sum + (ticket.resolvedAt.getTime() - ticket.createdAt.getTime());
        }
        return sum;
      }, 0);
      averageResponseTime = totalTime / resolvedTicketsWithTime.length / (1000 * 60 * 60); // Convert to hours
    }

    return {
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      urgentTickets,
      averageResponseTime,
    };
  }

  async getAllTickets(query: QuerySupportTicketsDto) {
    const { search, status, priority, assignedTo, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (assignedTo) {
      where.assignedTo = assignedTo;
    }

    const [tickets, total] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' },
        ],
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
          attachments: {
            select: {
              id: true,
              fileName: true,
              fileSize: true,
              contentType: true,
            },
          },
        },
      }),
      this.prisma.supportTicket.count({ where }),
    ]);

    return {
      success: true,
      data: tickets.map((ticket) => ({
        id: ticket.id,
        userId: ticket.userId,
        userEmail: ticket.user?.email || ticket.email,
        subject: ticket.subject,
        message: ticket.message,
        status: ticket.status,
        priority: ticket.priority,
        assignedTo: ticket.assignedTo,
        attachmentCount: ticket.attachments.length,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
        resolvedAt: ticket.resolvedAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTicketById(id: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        attachments: true,
      },
    });

    if (!ticket) {
      return {
        success: false,
        message: 'Ticket not found',
      };
    }

    return {
      success: true,
      data: {
        id: ticket.id,
        userId: ticket.userId,
        userEmail: ticket.user?.email || ticket.email,
        subject: ticket.subject,
        message: ticket.message,
        status: ticket.status,
        priority: ticket.priority,
        assignedTo: ticket.assignedTo,
        attachments: ticket.attachments,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
        resolvedAt: ticket.resolvedAt,
      },
    };
  }

  async updateTicketStatus(id: string, status: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return {
        success: false,
        message: 'Ticket not found',
      };
    }

    const updateData: any = { status };

    // Set resolvedAt timestamp when status changes to RESOLVED
    if (status === 'RESOLVED' && ticket.status !== 'RESOLVED') {
      updateData.resolvedAt = new Date();
    }

    const updatedTicket = await this.prisma.supportTicket.update({
      where: { id },
      data: updateData,
    });

    return {
      success: true,
      message: 'Ticket status updated successfully',
      data: updatedTicket,
    };
  }

  async updateTicketPriority(id: string, priority: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return {
        success: false,
        message: 'Ticket not found',
      };
    }

    const updatedTicket = await this.prisma.supportTicket.update({
      where: { id },
      data: { priority },
    });

    return {
      success: true,
      message: 'Ticket priority updated successfully',
      data: updatedTicket,
    };
  }

  async assignTicket(id: string, assignedTo: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return {
        success: false,
        message: 'Ticket not found',
      };
    }

    const updatedTicket = await this.prisma.supportTicket.update({
      where: { id },
      data: {
        assignedTo,
        status: ticket.status === 'OPEN' ? 'IN_PROGRESS' : ticket.status,
      },
    });

    return {
      success: true,
      message: 'Ticket assigned successfully',
      data: updatedTicket,
    };
  }

  async deleteTicket(id: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id },
      include: {
        attachments: true,
      },
    });

    if (!ticket) {
      return {
        success: false,
        message: 'Ticket not found',
      };
    }

    // Delete attachments first (cascading should handle this, but being explicit)
    await this.prisma.supportAttachment.deleteMany({
      where: { ticketId: id },
    });

    // Delete the ticket
    await this.prisma.supportTicket.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Ticket deleted successfully',
    };
  }
}
