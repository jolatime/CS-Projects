import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router'
import { loadPage, handleSubmission, getAdmin } from '../Helper/ContestSetup';
import { getEmail, gotoPage } from '../Helper/Helpers';
import { TerminalService } from '../Helper/terminal.service';
import { SocketIOService } from '../notifications/socket-io.service';


@Component({
  selector: 'app-contest-page',
  imports: [NgIf],
  templateUrl: './contest-page.component.html',
  styleUrl: './contest-page.component.css'
})

export class ContestPageComponent implements OnInit {
  isPractice: boolean = false;
  isAdmin: boolean = this.isItAdmin();
  notificationMessage: string | null = null;

  constructor(private renderer: Renderer2, 
    private el: ElementRef, 
    private router: Router, 
    private terminalService: TerminalService,
    private socketService: SocketIOService) {}

  ngOnInit(): void {
    const isItPractice = sessionStorage.getItem('Prac');
    if(isItPractice === 'true'){
      this.isPractice = true;
   }
    // attach to terminal onload
    this.terminalService.reattachTerminal();

    loadPage(this.renderer, this.el, this, this.isPractice);
  }
  
  // clear and set terminal for new flag
  async ClearAndSetTerminal() {
    await this.terminalService.ClearTerminal();
    await this.terminalService.reattachTerminal();
  }

  onSubmission(): void{
    handleSubmission(this.el, this.socketService);
  }
  
  confirmSelection(num: number){
    const confirmSelection_ = confirm("You will lose your current flag progress, are you sure?");
    if(confirmSelection_){
      const email = getEmail();
      if(num === 1)
        gotoPage(this.router, '/user-menu');
      else
        gotoPage(this.router, '/user-profileAC');
    }
    else
      console.log("Profile navigation canceled");
  }

  navtoPageA(): void {
    gotoPage(this.router, '/contest-page');
  }

  navtoPageUM(): void{
    gotoPage(this.router, '/user-menu')
  }

  isItAdmin(): boolean{
    if(getAdmin() === "True")
      return true;
    else
      return false;
  }
}

  