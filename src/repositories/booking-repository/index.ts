import { prisma } from "@/config";

async function findBooking(userId: number) {
    return prisma.booking.findFirst({
        where: {
            userId
        },
        include: {
            Room: true
        }
    });
}

async function createBooking(userId: number, roomId: number) {
    return prisma.booking.create({
        data: {
            userId,
            roomId
        }
    });
}

async function updateBooking(bookingId:number, roomId: number) {
    return prisma.booking.update({
        where:{
            id: bookingId
        },
        data: {
            roomId
        }
    });
}

async function findRoom(roomId: number) {
    return prisma.room.findFirst({
        where:{
            id: roomId
        }
    })
}

async function findManyBookingsByRoom(roomId: number) {
    return prisma.booking.findMany({
        where:{
            roomId
        }
    })
}

const bookingRepository = {
    findBooking,
    createBooking,
    updateBooking,
    findRoom,
    findManyBookingsByRoom
};

export default bookingRepository;