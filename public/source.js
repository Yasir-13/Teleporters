const socket = io();
const jumbotron = document.querySelector(".jumbotron");
const userValue = document.querySelector("#userVal")
const userSub= document.querySelector("#sub");
const form = document.querySelector("form");
const input = document.querySelector("#bottom");
const vidIcon = document.querySelector("#vidIcon");
const intro = document.querySelector(".intro");
const send = document.querySelector("#send");
const chatBox = document.querySelector(".chat");
const typing = document.getElementById("typing");
const vidDiv = document.querySelector(".myVidiv")
const myVideo = document.getElementById("myVideo");
const secDiv = document.querySelector(".mySecdiv");
const secVideo = document.getElementById("secVideo");
const inp = document.querySelector(".inp");
const body = document.querySelector("body");
const border = document.querySelector("#bdr");
let creator = false;
let userStream;
let screenStream;
let rtcPeerConnection;
let userVal;
let screenShare;

userSub.addEventListener("click" , function(event) {
    if(!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
        console.log("yasir is here")
    } else{
        event.preventDefault();
        userVal = userValue.value;
        console.log(userVal);
        socket.emit("join" ,  roomVal , userVal);
        body.style.backgroundColor = "black" ;
        form.style.display = "none";
        intro.classList.remove("dNone");
        chatBox.classList.remove("dNone");
        inp.classList.remove("dNone");
        border.classList.remove("dNone");
        vidDiv.classList.remove("dNone");
        secDiv.classList.remove("dNone");
        jumbotron.classList.add("dNone");
    }
 form.classList.add("was-validated");
})

const ice = {
    iceServers : [
            {url:'stun:stun01.sipphone.com'},
            {url:'stun:stun.ekiga.net'},
            {url:'stun:stun.fwdnet.net'},
            {url:'stun:stun.ideasip.com'},
            {url:'stun:stun.iptel.org'},
            {url:'stun:stun.rixtelecom.se'},
            {url:'stun:stun.schlund.de'},
            {url:'stun:stun.l.google.com:19302'},
            {url:'stun:stun1.l.google.com:19302'},
            {url:'stun:stun2.l.google.com:19302'},
            {url:'stun:stun3.l.google.com:19302'},
            {url:'stun:stun4.l.google.com:19302'},
            {url:'stun:stunserver.org'},
            {url:'stun:stun.softjoys.com'},
            {url:'stun:stun.voiparound.com'},
            {url:'stun:stun.voipbuster.com'},
            {url:'stun:stun.voipstunt.com'},
            {url: "stun:stun.services.mozilla.com"},
            {url: "stun:stun.l.google.com:19302"},
            {url: "stun:stun1.l.google.com:19302"},
            {url: "stun:stun3.l.google.com:19302"},
            {url: "stun:stun4.l.google.com:19302"},
            {"urls":"turn:numb.viagenie.ca", "username":"webrtc@live.com", "credential":"muazkh"},
            {url: "stun:stun.ekiga.net"},
    ]
}

// const url = window.location.href;
// const urlObj = new URL(url);
// const user = urlObj.searchParams.get("username");
// const room = urlObj.searchParams.get("roomname");



// sub.addEventListener("click " , (e)=>{
//     console.log("heyyy")
//     const userVal = userValue.value;
//     console.log(userVal);
//     socket.emit("join" ,  roomVal , userVal);
// } );

// window.addEventListener("load" , ()=> {
//     alert ("you want to leave the room?")
// })

input.addEventListener("keypress" , (e) => {
    socket.emit("typing" , roomVal , `${userVal} is typing...`)
    console.log("someone is typing")
})

socket.on("display-typing" , function(text) {
     typing.innerHTML = text;
    console.log(typing.textContent)
    setTimeout (()=> {
       typing.innerHTML = " "; 
    } , 5000)

})

// const getMedia = navigator.mediaDevices.getUserMedia || navigator.mediaDevices.webkitGetUserMedia ||
//                                 navigator.mediaDevices.mozGetUserMedia;
 const screen = document.querySelector("#screen");
 

socket.on("full" , function() {
     console.log("room is full");
 })

   socket.on("created" ,   function() {
       creator = true;
            console.log("room is created");
            vidIcon.addEventListener("click" , async (e) => {
                // socket.on("created" , async function() {
             console.log("video call")
                  const stream = await navigator.mediaDevices.getUserMedia({
                     video:{
                                width: 1920,
                                height : 1080
                            },
                    audio: true
                 });
                        userStream = stream;
                        myVideo.srcObject = stream;
                        myVideo.play();
         });       
         screen.addEventListener("click" , async(e) => {
             screenShare = true;
            const stream = await navigator.mediaDevices.getDisplayMedia({
             video: {
                 mediaSource: "screen",
                 width: { max: '1920' },
                 height: { max: '1080' },
                 frameRate: { max: '10' }
               }
              
            })
            screenStream = stream;
            myVideo.srcObject = stream;
            myVideo.play();
            // socket.emit("initiate" , roomVal);
         });
        });


socket.on("joined" , function() {
    creator = false;
    console.log("someone joined")
    vidIcon.addEventListener("click" , async (e) => {
        // socket.on("created" , async function() {
     console.log("video call")
          const stream = await navigator.mediaDevices.getUserMedia({
             video:{
                        width: 1920,
                        height : 1080
                    },
            audio: true
         }); 
                userStream = stream;
                myVideo.srcObject = stream;
                myVideo.play();
                socket.emit("ready" , roomVal);
 })
 screen.addEventListener("click" , async(e) => {
    const stream = await navigator.mediaDevices.getDisplayMedia({
     video: {
         mediaSource: "screen",
         width: { max: '1920' },
         height: { max: '1080' },
         frameRate: { max: '10' }
       }
      
    })
    screenStream = stream;
    myVideo.srcObject = stream;
    myVideo.play();
    socket.emit("initiate" , roomVal);
 });
})

socket.on("ready" , function() {
    if(creator) {
    rtcPeerConnection = new RTCPeerConnection(ice);
    rtcPeerConnection.onicecandidate = iceCandidateFunction;
    rtcPeerConnection.ontrack = onTrackFunction;
    rtcPeerConnection.addTrack(userStream.getTracks()[0] , userStream);
    rtcPeerConnection.addTrack(userStream.getTracks()[1] , userStream);
    rtcPeerConnection.createOffer()
    .then((offer) => {
      rtcPeerConnection.setLocalDescription(offer);
      socket.emit("offer", {
          type: "offer",
          sdp : offer,
          roomVal
      });
    })
    .catch((error) => {
      console.log(error);
    });
}
})

socket.on("initiate" , function(){
    console.log("entered initiate");
    if(!creator) {
        rtcPeerConnection = new RTCPeerConnection(ice);
        rtcPeerConnection.onicecandidate = iceCandidateFunction;
        rtcPeerConnection.ontrack = onTrackFunction;
        rtcPeerConnection.addTrack(screenStream.getTracks()[0] , screenStream);
        // // rtcPeerConnection.addTrack(screenStream.getTracks()[1] , screenStream);
        rtcPeerConnection.createOffer()
        .then((offer) => {
          rtcPeerConnection.setLocalDescription(offer);
          socket.emit("offers", {
              type: "offer",
              sdp : offer,
              roomVal
          });
        })
        .catch((error) => {
          console.log(error);
        });
    }
})

socket.on("candidate" , function(candidate) {
    let icecandidate = new RTCIceCandidate(candidate);
    rtcPeerConnection.addIceCandidate(icecandidate);
})


socket.on("offer" , function(offer) {
    if(!creator) {
        rtcPeerConnection = new RTCPeerConnection(ice);
        rtcPeerConnection.onicecandidate = iceCandidateFunction;
        rtcPeerConnection.ontrack = onTrackFunction;
        rtcPeerConnection.addTrack(userStream.getTracks()[0] , userStream);
        rtcPeerConnection.addTrack(userStream.getTracks()[1] , userStream);
        rtcPeerConnection.setRemoteDescription(offer.sdp);
        rtcPeerConnection.createAnswer()
        .then((answer) => {
          rtcPeerConnection.setLocalDescription(answer);
          socket.emit("answer", {
              type: "answer",
              sdp : answer,
              roomVal
          });
        })
        .catch((error) => {
          console.log(error);
        });
    }
})

socket.on("offers" , function(offer){
    if(creator) {
        console.log("entered");
        rtcPeerConnection = new RTCPeerConnection(ice);
        rtcPeerConnection.onicecandidate = iceCandidateFunction;
        rtcPeerConnection.ontrack = onTrackFunction;
        // rtcPeerConnection.addTrack(screenStream.getTracks()[0] , screenStream);
        // rtcPeerConnection.addTrack(screenStream.getTracks()[1] , screenStream);
        rtcPeerConnection.setRemoteDescription(offer.sdp);
        rtcPeerConnection.createAnswer()
        .then((answer) => {
          rtcPeerConnection.setLocalDescription(answer);
          socket.emit("answer", {
              type: "answer",
              sdp : answer,
              roomVal
          });
        })
        .catch((error) => {
          console.log(error);
        });
    }
})

socket.on("answer" , function(answer) {
 rtcPeerConnection.setRemoteDescription(answer.sdp);
})
   
function iceCandidateFunction(event) {
    console.log(event.candidate);
    if(event.candidate) {
            socket.emit("candidate" , event.candidate , roomVal);
    }
}
 
async function onTrackFunction  (event) {
    secVideo.srcObject = event.streams[0];
    const playVideo = await secVideo.play();
    if (playVideo !== undefined)
 {
     playVideo.then(_  => {
         console.log("video is playing now");
         secVideo.pause(); 
     })

     .catch (error => {
         console.log("video interrupted");
     });
 }}


send.addEventListener("click" , (e)=> {
    e.preventDefault();
     const val = input.value;
    console.log(val);
    socket.emit("send" , val , roomVal , userVal); 
    insert(val , "sent-text" );    
})



socket.on("received" , function(val , userVal) {
   insert(val , "received-text" , userVal);
   console.log("received the text")
})


function insert (val , pos , userVal = "" ) {
    const div = document.createElement("div");
    div.classList.add(pos);
    div.innerHTML = ` <span class="d-block pb-1 text-capitalize " ><strong>${userVal}</strong></span>  ${val}`;
    chatBox.appendChild(div);
    input.value = ""
    };
