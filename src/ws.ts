import { Socket, Server } from "socket.io";
import SuperHeroes from "./heroes";
const superHeroes = new SuperHeroes();

export default (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("conencted", socket.id);
    io.to(socket.id).emit("on-connected", superHeroes.listOfSuperHeroes());

    // a user requests a super hero as a user
    socket.on("pick", (superHeroName: string) =>
      superHeroes.assignSuperHero(io, socket, superHeroName)
    );

    socket.on(
      "request",
      ({ superHeroName, offer }: { superHeroName: string; offer: any }) =>
        superHeroes.requestCall({ io, socket, callee: superHeroName, offer })
    );

    socket.on("cancel-request", () => superHeroes.cancelRequest(io, socket));

    socket.on(
      "response",
      ({
        requestId,
        answer = null
      }: {
        requestId: string;
        answer: any | null;
      }) => superHeroes.reponseToRequest({ io, socket, requestId, answer })
    );

    socket.on("candidate", ({ him, candidate }) => {
      socket.broadcast.to(him).emit("on-candidate", candidate);
    });

    socket.on("finish-call", () => superHeroes.finishCall(io, socket, false));

    // if the current socket has been disconnected
    socket.on("disconnect", () => {
      const {
        superHeroAssiged
      }: { superHeroAssiged: string | null } = socket.handshake.query;

      if (superHeroAssiged) {
        console.log("disconnected", superHeroAssiged);
        superHeroes.cancelRequest(io, socket);
        superHeroes.finishCall(io, socket, true);
        socket.handshake.query.superHeroAssiged = null;
        superHeroes.enabledAgain(io, superHeroAssiged);
      }
    });
  });
};
