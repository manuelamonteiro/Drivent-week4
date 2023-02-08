import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { notFoundError } from "@/errors";
import { cannotListHotelsError } from "@/errors/cannot-list-hotels-error";
import bookingRepository from "@/repositories/booking-repository";

async function getBookingService(userId: number) {

    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
    
    if (!enrollment) {
        throw notFoundError();
    }

    const bookingExists = await bookingRepository.findBooking(userId);

    if (!bookingExists) {
        throw notFoundError();
    }

    return bookingExists;

}

async function postBookingService(userId: number, roomId: number) {

    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
    
    if (!enrollment) {
        throw notFoundError();
    }

    const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);

    if (!ticket || ticket.status === "RESERVED" || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
        throw cannotListHotelsError();
    }

    const room = await bookingRepository.findRoom(roomId);

    if (!room) {
        throw notFoundError();
    }

    const booking = await bookingRepository.createBooking(userId, roomId);

    return booking.id;
}

async function putBookingService(userId: number, bookingId: number, roomId: number) {

    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
    
    if (!enrollment) {
        throw notFoundError();
    }

    const bookingExists = await bookingRepository.findBooking(userId);

    if (!bookingExists) {
        throw notFoundError();
    }

    const room = await bookingRepository.findRoom(roomId);

    if (!room) {
        throw notFoundError();
    }

    const booking = await bookingRepository.updateBooking(bookingId, roomId);

    return booking.id;

}

const bookingService = {
    getBookingService,
    postBookingService,
    putBookingService
};

export default bookingService;
