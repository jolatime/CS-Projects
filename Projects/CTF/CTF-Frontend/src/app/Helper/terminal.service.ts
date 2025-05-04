/*
  Alex Miller
  Jordan Latimer

  Service file for Terminals
*/

import { Injectable } from '@angular/core';
import { Terminal } from '@xterm/xterm';
import { AttachAddon } from '@xterm/addon-attach';
import { getEmail } from './Helpers';

@Injectable({
  providedIn: 'root'
})
export class TerminalService {

  private term: Terminal; // terminal for container
  private socket: WebSocket | null = null; // websocket attached to container

  constructor() { 
    this.term = new Terminal();
  }

  // get the terminal
  getTermainal() : Terminal {
    return this.term;
  }

  // set the terminal
  setTerminal(newTerm: Terminal) : void {
    this.term = newTerm;
  }

  ClearTerminal() : void {
    if(this.term){
      this.term.write("\x1b[2J");
      this.term.write("\x1b[H");
      this.term.write('Loading Environment...');
    }
  }

  // create terminal
  CreateTerminal(): void {
    const container = document.getElementById('Linux_Shell');
    if (container && this.term) {
      this.term.open(container);
      this.CreateWebSocket();
    }
  }

  // create the web socket connection
  CreateWebSocket() {
    this.socket = new WebSocket('/ws');
    this.socket.onopen = () => {
      if (this.socket) {
        this.socket.send(JSON.stringify(getEmail()));
        console.log('WebSocket opened');

        setTimeout(() => {
          const attachAddon = new AttachAddon(this.socket!);
          this.term.loadAddon(attachAddon);
          this.term.focus();
          console.log('reattached attachAddon');
        });
      }
      
    }
  }

  // reattach the terminal for a new flag
  reattachTerminal() {
    if (this.term) {
      this.term.dispose();
      this.term = new Terminal();
    }

    this.CreateTerminal(); // create the new terminal
  }
}
