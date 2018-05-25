import React, { Component } from 'react';
import PubNub from 'pubnub';
import './App.css';

class App extends Component {
    state ={
        chatOpen: false
    }

    componentDidMount(){
        const user = { 
            userName: "me",
            status: "good"
        } 

        this.PubNub = new PubNub({
            publish_key: 'pub-c-a2ba88c3-d357-4572-8781-223d204e3577',
            subscribe_key: 'sub-c-3b25421e-5ab4-11e8-89ba-521aa9825b79',
            uuid: user.userName
        });

        var self =this;        
               
        this.PubNub.addListener({
            status: function(statusEvent) {
                if (statusEvent.category === "PNConnectedCategory") {                  
                    self.PubNub.setState(
                        { 
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
                console.log("action", data);
                if(data.action==="join"){
                    console.log("user join", data);
                    
                } else if(data.action==="timeout"||data.action==="leave"){
                    console.log("user leave", data);
                    
                } else{
                    console.log("this is state change");
                }
            }
        });
      }

    enterChatRoom = ()=>{
        console.log("join");
        var roomName ="me";
        this.PubNub.hereNow(
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

        this.PubNub.subscribe({
            channels: [roomName],
            withPresence: true 
        });
        
        this.setState({
            chatOpen: true
        });      
    }

    leaveChatRoom = ()=>{
        console.log("leave");
        const roomName ="me";
        this.PubNub.unsubscribe({
            channels: [roomName]
        }); 
        this.setState({
            chatOpen: false
        });
    }

 
    render() {
        return (
            <div className="App">
                <header className="App-header">
                  <h1 className="App-title">Chat Room</h1>
                </header>
                { 
                    this.state.chatOpen?<div>
                      <div className="chat-area"></div>
                      <button onClick={ this.leaveChatRoom } > leave ChatRoom</button>
                    </div>:<button className="App-intro" onClick ={ this.enterChatRoom } >
                      Enter into ChatRoom
                    </button>
                }
            </div>
        );
    }
}

export default App;
