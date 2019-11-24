import { Socket, Server } from "socket.io";
import SuperHeroes from "./heroes";

const superHeroes = new SuperHeroes();

export default (io: Server) => {
  io.on("connection", (socket: Socket) => {
    socket.emit("on-superheores", superHeroes.data);

    // a user requests a super hero as a user
    socket.on("pick", (superHeroName: string) =>
      superHeroes.assignSuperHero(socket, superHeroName)
    );

    socket.on(
      "request",
      ({ superHeroName, data }: { superHeroName: string; data: any }) =>
        superHeroes.requestCall({ socket, superHeroName, data })
    );

    socket.on(
      "response",
      ({ requestId, data = null }: { requestId: string; data: any | null }) =>
        superHeroes.reponseToRequest({ socket, requestId, data })
    );

    // if the current socket has been disconnected
    socket.on("disconnect", () => {
      const {
        superHeroAssiged
      }: { superHeroAssiged: string | null } = socket.handshake.query;

      if (superHeroAssiged) {
        superHeroes.enabledAgain(socket, superHeroAssiged);
      }
    });
  });
};
