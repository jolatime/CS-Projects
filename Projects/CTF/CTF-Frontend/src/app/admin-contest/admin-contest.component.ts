import { Component, ElementRef, Renderer2 } from '@angular/core';
import { gotoPage, getEmail } from '../Helper/Helpers';
import { Router } from '@angular/router';
import { loadPage } from '../Helper/ContestSetup';
import { TerminalService } from '../Helper/terminal.service';

@Component({
  selector: 'app-admin-contest',
  imports: [],
  templateUrl: './admin-contest.component.html',
  styleUrl: './admin-contest.component.css'
})
export class AdminContestComponent {

  constructor(private renderer: Renderer2, private el: ElementRef, private router: Router, private terminalService: TerminalService){}

  ngOnInit(): void {

      // attach to terminal onload
      this.terminalService.reattachTerminal();
  
      loadPage(this.renderer, this.el, this, false);
    }

    confirmSelection(){
      const confirmSelection_ = confirm("You will lose your current flag progress, are you sure?");
      if(confirmSelection_){
        gotoPage(this.router, '/admin-profile');
      }
      else
        console.log("Profile navigation canceled");
    }

    // clear and set terminal for new flag
    async ClearAndSetTerminal() {
      await this.terminalService.ClearTerminal();
      await this.terminalService.reattachTerminal();
    }
}
