import { Response } from "express";
import { AuthenticatedRequest } from "@/middlewares";
import httpStatus from "http-status";
import bookingService from "@/services/booking-service";

export async function getBooking(req: AuthenticatedRequest, res: Response) {

    const { userId } = req;

    try {
        const booking = await bookingService.getBookingService(Number(userId));
        return res.send(httpStatus.OK).send(booking);
    } catch (error) {
        if (error.name === "NotFoundError") {
            return res.sendStatus(httpStatus.NOT_FOUND);
        }

        return res.sendStatus(httpStatus.BAD_REQUEST);
    }
}

export async function postBooking(req: AuthenticatedRequest, res: Response) {

    const { userId } = req;
    const { roomId } = req.body;

    try {
        const booking = await bookingService.postBookingService(Number(userId), Number(roomId));
        return res.status(httpStatus.OK).send({ bookingId: booking });
    } catch (error) {
        if (error.name === "NotFoundError") {
            return res.sendStatus(httpStatus.NOT_FOUND);
        }

        if (error.name === "CannotListHotelsError") {
            return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
        }

        if (error.name === "CannotBookingError") {
            return res.sendStatus(httpStatus.FORBIDDEN);
        }

        return res.sendStatus(httpStatus.FORBIDDEN);
    }
}

export async function putBooking(req: AuthenticatedRequest, res: Response) {

    const { userId } = req;
    const { bookingId } = req.params;
    const { roomId } = req.body;

    try {
        const booking = await bookingService.putBookingService(Number(userId), Number(bookingId), Number(roomId));
        return res.status(httpStatus.OK).send({ bookingId: booking });
    } catch (error) {
        if (error.name === "NotFoundError") {
            return res.sendStatus(httpStatus.NOT_FOUND);
        }

        if (error.name === "CannotListHotelsError") {
            return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
        }

        if (error.name === "CannotBookingError") {
            return res.sendStatus(httpStatus.FORBIDDEN);
        }

        return res.sendStatus(httpStatus.FORBIDDEN);
    }
}
