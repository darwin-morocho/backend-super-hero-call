# EMITs

Event Names for "emit"

- **_`pick`_** `( string ) :` emit to this `eventName` to select your hero profile. After listen the eventName `on-assigned` to know the answer to this emit.

- **_`request`_** `( { superHeroName: string, offer: { "sdp": string, "type": string } } ) :` emit to this event to make a call with other superhero user. Use the listener **`on-response`** to get the answer to your request.

- **_`cancel-request :`_** if you are making a request call and you want cancel the request.

* **_`response`_** `( { requestId:string, answer: any | null } ) :` you must issue to this event to accept or decline an incoming call. Send `answer` as `null` to decline the incoming call.

- **_`finish-call :`_** emit to dis event to finish a current call.

- **_`candidate ({ him: string, candidate: { candidate: string, sdpMid: string, sdpMLineIndex: number} }) :`_** when both accept the connection we need send their ICE Candidates to the other user.


# ONs

Event Names for "on"

- **_`on-assigned`_** `( string | null ) :` when you emit to `pick` and the server check if the hero is available you will get a `string` with the `superHeroName` if the superhero was assiged to you. You will get `null` if the superhero was taken by other user.

* **_`on-disconnected`_** `( string ) :` the server emit to this event when a superhero disconnects. The received `string` is the name of the superhero that disconnected.

* **_`on-taken`_** `( string ) :` when a superhero was assigned to one user the server emit to this event with the name of the superhero assigned.

- **_`on-request`_** `( { superHeroName: string, requestId:string, offer: any | null } ) :` you need to listen to this event to know when a user is calling you.

- **_`on-cancel-request :`_** when you are in an incomming call and the caller finished the call before you take it.

- **_`on-response`_** `( { superHeroName: string, answer: any | null } ) :` when you call another user with `on-request` you need to listen to this event to know if the other user accepts or rejects your call request. `answer` will be `null` if the user refuses or he does not answer the call.


- **_`on-finish-call :`_**  invoked when the other user finish the call

- **_`on-candidate ({ candidate: string, sdpMid: string, sdpMLineIndex: number} ):`_**  the ICE Candidate to the other user in the current call
