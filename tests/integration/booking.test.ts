import app, { init } from "@/app";
import { prisma } from "@/config";
import faker from "@faker-js/faker";
import { TicketStatus } from "@prisma/client";
import e from "express";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import {
  createHotel,
  createUser,
  createEnrollmentWithAddress,
  createTicketType,
  createTicket,
  createTicketTypeWithHotel,
  createTicketTypeWithoutHotel
} from "../factories";
import { cleanDb, generateValidToken } from "../helpers";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("GET /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/booking");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("Should respond with 403 when user doesnt have enrollment", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });
  });
});

describe("POST /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.post("/booking");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    const generateBody = () => ({
      roomId: faker.datatype.number(),
    });

    it("Should respond with 403 when user doesnt have enrollment", async () => {
      
      const user = await createUser();
      const token = await generateValidToken(user);

      const body = generateBody();

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
     
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 when ticket has not been paid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const body = generateBody();
      
      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
      
      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 when the event is remote", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithoutHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const body = generateBody();
      
      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
      
      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403  when the event does not include a hotel", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithoutHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const body = generateBody();
      
      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
      
      expect(response.status).toEqual(httpStatus.FORBIDDEN);
  });
});

describe("PUT /booking/:bookingId", () => {
    it("should respond with status 401 if no token is given", async () => {
      const response = await server.put("/booking/1");
  
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
  
    it("should respond with status 401 if given token is not valid", async () => {
      const token = faker.lorem.word();
  
      const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`);
  
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
  
    it("should respond with status 401 if there is no session for given token", async () => {
      const userWithoutSession = await createUser();
      const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
  
      const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`);
  
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe("when token is valid", () => {
      const generateBody = () => ({
        roomId: faker.datatype.number(),
      });
      
      it("Should respond with 403 when user doesnt have enrollment", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);

        const body = generateBody();
  
        const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`).send(body);
  
        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });

      it("should respond with status 403 when ticket has not been paid", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketType();
        await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

        const body = generateBody();
        
        const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`).send(body);
        
        expect(response.status).toEqual(httpStatus.FORBIDDEN);
      });
  
      it("should respond with status 403 when the event is remote", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithoutHotel();
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

        const body = generateBody();
        
        const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`).send(body);
        
        expect(response.status).toEqual(httpStatus.FORBIDDEN);
      });
  
      it("should respond with status 403  when the event does not include a hotel", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithoutHotel();
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

        const body = generateBody();
        
        const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`).send(body);
        
        expect(response.status).toEqual(httpStatus.FORBIDDEN);
      });
    });
  });
});
