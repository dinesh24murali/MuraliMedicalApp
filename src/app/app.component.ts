import { ViewChild,ElementRef,Component } from '@angular/core';
import {MdToolbarModule,MdButtonModule} from '@angular/material';

@Component({
  selector: 'my-app',
  templateUrl: './Templates/main.html',
  styles:[`
  .top-correction{
      top: 50px;
  }
  `]
})
export class AppComponent  {

    @ViewChild('sideNavBar') sideNavBar: ElementRef;
    navBar: Boolean = false;

    openAccordion(type:string): void {
        var x = document.getElementById("Accordion"+type);
        if (x.className.indexOf("w3-show") == -1) {
            x.className += " w3-show";
            x.previousElementSibling.className += " w3-green";
        } else { 
            x.className = x.className.replace(" w3-show", "");
            x.previousElementSibling.className = 
            x.previousElementSibling.className.replace(" w3-green", "");
        }
    }

    nav_toggle(): void {
        if(!this.navBar){
            let width = document.getElementById("main").style.width;
            document.getElementById("main").style.minWidth = width;
            document.getElementById("main").style.marginLeft = "15%";
            document.getElementById("SideNavbar").style.width = "15%";
            document.getElementById("SideNavbar").style.display = "block";
            this.navBar = true;
        }else{
            document.getElementById("main").style.marginLeft = "0%";
            document.getElementById("SideNavbar").style.display = "none";
            this.navBar = false;            
        }
        // document.getElementById("openNav").style.display = 'none';
    }

    nav_out(): void {
        document.getElementById("main").style.marginLeft = "0%";
        document.getElementById("SideNavbar").style.display = "none";
        this.navBar = false;  
    }
 }
