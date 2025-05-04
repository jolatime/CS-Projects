import { Component, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { TerminalService } from '../Helper/terminal.service';
import { getEmail, gotoPage, Popup, updateContainer } from '../Helper/Helpers';
import { ModifyContestService } from './modify-contest.service';
import { Contest } from '../models/contest.model';
import { NgFor, CommonModule } from '@angular/common';
import { Flag } from '../models/flag.model';
import { Image } from '../models/image.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modify-contest',
  imports: [NgFor, CommonModule, FormsModule],
  templateUrl: './modify-contest.component.html',
  styleUrl: './modify-contest.component.css'
})

export class ModifyContestComponent {
  contests: Contest[] = []; 
  activeContest: number | null = null;
  flagsForContest: Flag[] = [];
  selectedContestId: number = 0;
  selectedFlag: Flag | null = null;
  selectedFlagImage: Image | null = null;
  allImages: Image[] = [];
  isDialogVisible = false;
  selectedImage: string = "Select an Image";
  constructor(private renderer: Renderer2, private router: Router, private modifyContestService: ModifyContestService, private terminalService: TerminalService){}

  ngOnInit(): void {
    
    this.terminalService.reattachTerminal();

    // style class for blue border
    this.renderer.addClass(document.documentElement, 'modify');

    this.loadContests();

    window.addEventListener("message", this.handlePopupMessage.bind(this));
  }

  // set app back to default when leaving this page
  ngOnDestroy(): void {
    this.renderer.removeClass(document.documentElement, 'modify');
  }

handlePopupMessage(event: MessageEvent): void {
  if (event.origin !== window.location.origin) return;
  if (event.data?.type === "FLAG_ADDED" && event.data?.contestId) {
    this.modifyContestService.loadFlagsForContest(event.data.contestId)
      .then(flags => this.flagsForContest = flags)
      .catch(err => console.error('Error reloading flags:', err));
    this.getImages();  
  }
}

  // Method to load contests
  async loadContests(): Promise<void> {
    const email = this.getEmail();
    try {
      const contestsData = await this.modifyContestService.loadContests(email);
      this.contests = contestsData || []; // Populate contests array
      this.activeContest = await this.modifyContestService.getActiveContest(this.getEmail()); //Getting the active contest
    } catch (error) {
      console.error('Error loading contests:', error);
    }
  }

  async getActiveContest(): Promise<void> {
    this.activeContest = await this.modifyContestService.getActiveContest(this.getEmail());
  }

  async getImages(): Promise<void> {
    const email = this.getEmail();
    try{
      const imageData = await this.modifyContestService.getImages(email);
      this.allImages = imageData || [];

      // get all of the images that are not linked to a flag
      let images : Image[] = [];
      for (let i=0; i < this.flagsForContest.length; i++) {
        
        // if the image for the flag is Ubuntu so no image
        if (this.allImages[i] === undefined) {
          continue;
        }
        if (this.flagsForContest[i].Image === this.allImages[i].Name) {
          images.push(this.allImages[i]); // images that are connected to a flag
        }
      }
      this.allImages = this.allImages.filter(item => !images.includes(item)); // change allImages to just have the ones that are not in images
    }catch(error){
      console.error(error);
    }
  }

  // Method to add a contest
  addContestPopup(): void {
    Popup('/add-contest');
  }

  addFlagPopup(): void{
    if(this.selectedContestId === 0)
      alert("Select a contest to add a flag!");
    else{
      Popup('/add-flag');
    }
      
  }

  navtoPageAI(): void{
    gotoPage(this.router, '/create-image');
  }

  // Method to set a contest as active
  async setContestActive(): Promise<void> {
    if (this.selectedContestId !== null) {
      try {
        const email = this.getEmail();
        const actOrDeact = await this.modifyContestService.setContestActive(this.selectedContestId, email);
        if(actOrDeact === 1){
          this.loadContests();
          console.log('Contest set as active');
        }
        else if(actOrDeact === 0)
          this.activeContest = null;
      } catch (error) {
        console.error('Error activating contest:', error);
      }
    }
  }

  async deleteContest(): Promise<void> {
    if (this.selectedContestId === 0) 
      alert("Select a contest to delete!");
    else if(this.activeContest === this.selectedContestId)
      alert("You can't delete an active contest!");
    else{
      try {
        await this.modifyContestService.deleteContest(this.selectedContestId);
        console.log('Contest deleted');
        this.loadContests(); // Refresh the contest list after deletion
        this.selectedContestId = 0;
        this.flagsForContest = [];
      } catch (error) {
        console.error('Error deleting contest:', error);
      }
    }
  }

  selectContest(contestId: number): void {
    this.selectedContestId = contestId;
    this.modifyContestService.loadFlagsForContest(contestId)
      .then((flags) => {
        this.flagsForContest = flags;
        this.getImages();
      }).catch((err) => {
        console.error('Failed to load flags:', err);
      })
      sessionStorage.setItem('selectedContestID', this.selectedContestId.toString());
    console.log('Selected contest ID:', contestId);
  }

  selectFlag(flag: Flag): void{
    this.selectedFlag = flag
    this.selectedFlagImage = null;
  }

  selectFlagImage(image: Image): void {
    this.selectedFlagImage = image;
    this.selectedFlag = null;
  }

  getEmail(): string {
    return getEmail();
  }

  navtoPageAP() {
    gotoPage(this.router, '/admin-profile');
  }

  showDialogBox(): void{
    if((!this.selectedFlag || this.selectedFlag.Name === null) && (!this.selectedFlagImage || this.selectedFlagImage.Name === null)){
      alert('You must select a flag first');
      return;
    }
    console.log('Opening dialog for flag:', this.selectedFlag); 
    this.isDialogVisible = true;
  }

  closeDialogBox(): void{
    this.isDialogVisible = false;
  }

  async DeleteFlag(): Promise<void>{
    if(!this.selectedFlag){
      console.log("No flag or image selected");
      alert("Please select a flag to delete.");
      return;
    }
    try{
      await this.modifyContestService.DeleteFlag(this.selectedFlag.FlagID);
      this.flagsForContest = await this.modifyContestService.loadFlagsForContest(this.selectedContestId);
    } catch(error){
      console.error("Failed deleting flag:", error);
    }
    console.log("Deleted Flag");
    this.isDialogVisible = false;
    this.selectedFlag = null;
    this.selectedFlagImage = null;
    this.getImages();
  }

  async DeleteImage(): Promise<void> {
    let imagename : string | undefined = "";

    // whether flag image or just image in general
    if (this.selectedFlag?.Image) imagename = this.selectedFlag?.Image;
    else imagename = this.selectedFlagImage?.Name;

    try {
      await this.modifyContestService.deleteImage(imagename); // delete the image
      this.allImages = await this.modifyContestService.getImages(this.getEmail());
    }
    catch(err) {
      console.error("Failed deleting image");
    }
    console.log("Deleted Image");

    // reset everything 
    this.isDialogVisible = false;
    this.selectedFlag = null;
    this.selectedFlagImage = null;
    console.log(this.allImages);
    this.selectContest(this.selectedContestId);
  }

  async TestImage(): Promise<void>{
    if(this.selectedImage === "Select an Image"){
      alert('you must select an Image first');
      return;
    }
    try{
      await this.modifyContestService.setNewActiveFlag(this.selectedImage, getEmail())
    } catch (error) {
      console.error("Failed setting up new image", error);
    }
    await updateContainer(getEmail());
    this.ClearAndSetTerminal();
  }

  // clear and set terminal for new flag
  async ClearAndSetTerminal() {
    await this.terminalService.ClearTerminal();
    await this.terminalService.reattachTerminal();
  }
}