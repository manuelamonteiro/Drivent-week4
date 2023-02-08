import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { notFoundError } from "@/errors";
import { cannotListHotelsError } from "@/errors/cannot-list-hotels-error";
import bookingRepository from "@/repositories/booking-repository";
import { cannotBookingError } from "@/errors/cannot-booking-error";

async function getBookingService(userId: number) {

    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
    
    if (!enrollment) {
        throw notFoundError();
    }

    const bookingExists = await validateBookingExistence(userId);   

    return bookingExists;

}

async function postBookingService(userId: number, roomId: number) {

    await validateTicket(userId);
    await validateRoomExistenceAndCapacity(roomId);

    const booking = await bookingRepository.createBooking(userId, roomId);

    return booking.id;
}

async function putBookingService(userId: number, bookingId: number, roomId: number) {

    await validateBookingExistence(userId);   
    await validateTicket(userId);
    await validateRoomExistenceAndCapacity(roomId);

    const booking = await bookingRepository.updateBooking(bookingId, roomId);

    return booking.id;

}

async function validateTicket(userId: number){

    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
    
    if (!enrollment) {
        throw notFoundError();
    }

    const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);

    if (!ticket || ticket.status === "RESERVED" || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
        throw cannotListHotelsError();
    }

}

async function validateBookingExistence(userId: number) {
    
    const bookingExists = await bookingRepository.findBooking(userId);

    if (!bookingExists) {
        throw notFoundError();
    }

    return bookingExists;

}

async function validateRoomExistenceAndCapacity(roomId: number) {
    
    const room = await bookingRepository.findRoom(roomId);

    if (!room) {
        throw notFoundError();
    }

    const bookings = await bookingRepository.findManyBookingsByRoom(roomId);

    if(bookings.length >= room.capacity){
        throw cannotBookingError();
    }

}

const bookingService = {
    getBookingService,
    postBookingService,
    putBookingService
};

export default bookingService;
