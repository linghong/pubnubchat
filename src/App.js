import React, { Component } from 'react';
import PubNub from 'pubnub';
import './App.css';

class App extends Component {
    state = {
        chatOpen: false,
        user: { 
            userName: "me",
            status: "good"
        } ,
        roomName: null
    }

    componentDidMount(){
        this.PubNub = new PubNub({
            publish_key: 'pub-c-a2ba88c3-d357-4572-8781-223d204e3577',
            subscribe_key: 'sub-c-3b25421e-5ab4-11e8-89ba-521aa9825b79',
            uuid: this.state.user.userName
        });
      }

    hereNow = roomName=> this.PubNub.hereNow(
            {
              channels: [roomName],
              includeUUIDs: true,
              includeState: true
            },
            function (status, response) {  
                var res =response.channels[roomName];
                console.log("occupants",  response, res.name, res.occupants);                               
            }
        );

    getListener = (roomName, user)=> {
        var self =this
        return{
            status: function(statusEvent) {
                if (statusEvent.category === "PNConnectedCategory") {                  
                    self.PubNub.setState(
                        { 
                            channels: [roomName],
                            state: user,
                            uuid: user.userName 
                        }, 
                        function (status, response) {
                            console.log("setState", response);
                        }
                    );
                }
            },
            message: function(msg) {
                            
            },
            presence: function(data) {

                if(data.action==="join"){
                    console.log("user join", data);                    
                } else if(data.action==="timeout"||data.action==="leave"){
                    console.log("user leave", data);
                    
                } else{
                    console.log("this is state change");
                }
            }
        }      
    }

    leaveChatRoom = ()=>{
        console.log("leave");
        const roomName ="me";
        this.PubNub.removeListener(this.listener)
        this.PubNub.unsubscribe({
            channels: [roomName]
        }); 
        this.setState({
            chatOpen: false
        });
    }

    handleRoomEnter = (e)=>{
        var roomName = e.target.getAttribute('value');
        this.listener = this.getListener(roomName, this.state.user );    
        this.PubNub.addListener(this.listener);
        this.PubNub.subscribe({
            channels: [roomName],
            withPresence: true 
        });
        
        this.setState({
            chatOpen: true, 
            roomName: roomName
        });      
    }

    fetchUserList =()=>{
       this.hereNow(this.state.roomName); 
    }
 
    render() {
        return (
            <div className="App">
                <header className="App-header">
                  <h1 className="App-title">Chat Room</h1>
                </header>
                { 
                    this.state.chatOpen?<div className="chat-room"> 
                    <button className="participant-list" onClick = {this.fetchUserList}>View Participants</button>                        
                      <div className="chat-area"></div> 
                      <button onClick={ this.leaveChatRoom } className="room-button" > {`leave ${this.state.roomName}`}</button>

                    </div>:
                    <ul onClick = { this.handleRoomEnter }>
                        <li className="room-list" value ="Chat Room1">
                          ChatRoom1
                        </li>
                        <li className="room-list" value="Chat Room 2">
                          ChatRoom2
                        </li>
                        <li className="room-list" value="Chat Room 3">
                          ChatRoom3
                        </li>
                    </ul>
                }
            </div>
        );
    }
}

export default App;
