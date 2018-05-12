import { Component } from '@angular/core';

@Component({
  selector: 'dash-board',
  template: `<h1>Dashboard</h1>
  <div class="w3-container">
<p>In this example, the sidebar is hidden (style="display:none")</p>
<p>It is shown when you click on the menu icon in the top left corner.</p>
<p>When it is opened, it shifts the page content to the right.</p>
<p>We use JavaScript to add a 25% left margin to the div element with id="main" when this happens. The value "25%" matches the width of the sidebar.</p>
</div>
`,
})
export class DashBoardComponent  { 

 }
