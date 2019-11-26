import { Socket, Server } from "socket.io";

export interface ISuperHero {
  name: string;
  avatar: string;
  available: boolean;
  inCall: boolean;
}

interface IRequest {
  timeOutId: NodeJS.Timeout;
  createdAt: Date;
  superHeroName: string;
}

const TIME_OUT = 30000;

export default class SuperHeroes {
  private data: Map<string, ISuperHero> = new Map<string, ISuperHero>();
  private requests: Map<string, IRequest> = new Map<string, IRequest>();

  constructor() {
    // initialize the superheroes
    const tmp: Array<ISuperHero> = [
      {
        name: "Super-Man",
        avatar:
          "https://superherotar.framiq.com/assets/examples/superherotar00.png",
        available: true,
        inCall: false
      },
      {
        name: "Iron-Man",
        avatar:
          "https://superherotar.framiq.com/assets/examples/superherotar05.png",
        available: true,
        inCall: false
      },
      {
        name: "Bat-Man",
        avatar:
          "https://superherotar.framiq.com/assets/examples/superherotar02.png",
        available: true,
        inCall: false
      },
      {
        name: "Wonder-Woman",
        avatar:
          "https://superherotar.framiq.com/assets/examples/superherotar01.png",
        available: true,
        inCall: false
      },
      {
        name: "Black-Widow",
        avatar:
          "https://superherotar.framiq.com/assets/examples/superherotar07.png",
        available: true,
        inCall: false
      },
      {
        name: "Elektra",
        avatar:
          "https://superherotar.framiq.com/assets/examples/superherotar06.png",
        available: true,
        inCall: false
      }
    ];
    tmp.forEach((item: ISuperHero) => {
      this.data.set(item.name, item);
    });
  }

  listOfSuperHeroes(): {} {
    let obj = Array.from(this.data).reduce(
      (obj, [key, value]) => Object.assign(obj, { [key]: value }), // Be careful! Maps can have non-String keys; object literals can't.
      {}
    );
    return obj;
  }

  getSuperHero(superHeroName: string): ISuperHero | null {
    if (this.data.has(superHeroName)) {
      return this.data.get(superHeroName)!;
    }
    return null;
  }

  assignSuperHero(io: Server, socket: Socket, superHeroName: string) {
    let superHero: ISuperHero | null = this.getSuperHero(superHeroName); // get the super hero by name

    if (superHero) {
      // if the super hero is inside the superHeroes map
      if (superHero.available) {
        //if the super hero is available
        superHero.available = false;
        this.data.set(superHeroName, superHero); // update the super hero availability
        socket.handshake.query.superHeroAssiged = superHeroName;
        socket.join(superHeroName); // join the socket to one room with the superhero name
        // We inform to the user that a superhero has been assigned
        io.to(socket.id).emit("on-assigned", superHeroName);
        //We inform other users that a superhero has been taken
        socket.broadcast.emit("on-taken", superHeroName);
      } else {
        // We inform to the user that the requested super hero is not available
        io.to(socket.id).emit("on-assigned", null);
      }
    }
  }

  enabledAgain(socket: Socket, superHeroName: string) {
    // if the user disconneted has a super hero assigned
    socket.leave(superHeroName); // the socket leave superhero room
    let superHero: ISuperHero | null = this.getSuperHero(superHeroName); // get the super hero by name

    if (superHero) {
      // if the super hero is inside the superHeroes map
      superHero.available = true;
      this.data.set(superHeroName, superHero); // update the superhero availability
    }
    socket.emit("on-disconnected", superHeroName); // We inform other users that a superhero has been disconnected
  }

  requestCall(requestData: {
    io: Server;
    socket: Socket;
    superHeroName: string;
    data: any;
  }) {
    let superHero: ISuperHero | null = this.getSuperHero(
      requestData.superHeroName
    ); // get the super hero by name
    // if the super hero is inside the superHeroes map and he can take a call
    if (superHero && !superHero.inCall) {
      // get the name of the superHero that is request the call
      const {
        superHeroAssiged
      }: {
        superHeroAssiged: string | null;
      } = requestData.socket.handshake.query;

      if (superHeroAssiged) {
        // We inform the user that another wants to connect for a call

        const requestId: string = `${superHeroAssiged}-${Date.now()}`; // create a requestId

        const timeOutId: NodeJS.Timeout = setTimeout(() => {
          // after the TIME_OUT and the user does not send an answer to this request
          // We inform the requesting user that the call was not taken
          requestData.io.to(requestData.socket.id).emit("on-response", {
            superHeroName: requestData.superHeroName,
            data: null
          });
          this.deleteRequest(requestId);
        }, TIME_OUT);

        // saves the request into map
        this.requests.set(requestId, {
          createdAt: new Date(),
          timeOutId,
          superHeroName: superHeroAssiged
        });

        // emit data to the requested user
        requestData.socket.to(requestData.superHeroName).emit("on-request", {
          superHeroName: superHeroAssiged,
          data: requestData.data,
          requestId
        });
      }
    } else {
      // We inform to the user that the requested superhero is not available to take the call
      requestData.io.to(requestData.socket.id).emit("on-response", {
        superHeroName: requestData.superHeroName,
        data: null
      });
    }
  }

  deleteRequest(requestId: string) {
    if (this.requests.has(requestId)) {
      const request: IRequest = this.requests.get(requestId)!;
      clearTimeout(request.timeOutId);
      this.requests.delete(requestId);
    }
  }

  reponseToRequest(responseData: {
    socket: Socket;
    requestId: string;
    data: any | null;
  }) {
    if (this.requests.has(responseData.requestId)) {
      const request: IRequest = this.requests.get(responseData.requestId)!;
      const createdAt: Date = request.createdAt; //request createdAt date
      const superHeroName: string = request.superHeroName; // the superhero name that requested the call
      const currentDate: Date = new Date(); //current date
      const difference: number =
        (currentDate.getTime() - createdAt.getTime()) / 1000; //diference in seconds

      this.deleteRequest(responseData.requestId);

      // if the user answer to the request before the TIME_OUT
      if (TIME_OUT - difference >= 1) {
        // get the name of the superHero that is sending the response to the call
        const {
          superHeroAssiged
        }: {
          superHeroAssiged: string | null;
        } = responseData.socket.handshake.query;

        if (superHeroAssiged) {
          // get the requesting super hero
          const requestingSuperHero: ISuperHero | null = this.getSuperHero(
            superHeroName
          );
          // if the requesting super hero can take the call
          if (requestingSuperHero && !requestingSuperHero.inCall) {
            if (responseData.data != null) {
              let me: ISuperHero = this.getSuperHero(superHeroName)!;
              me.inCall == true;
              this.data.set(me.name, me); // the superhero is in calling
            }

            // We send to the requesting user the response to the previous request
            responseData.socket.to(superHeroName).emit("on-response", {
              superHeroName: "",
              data: responseData.data
            });
          }
        }
      }
    }
  }
}
