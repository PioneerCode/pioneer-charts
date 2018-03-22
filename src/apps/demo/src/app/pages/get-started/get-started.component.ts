import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'pc-get-started',
  templateUrl: './get-started.component.html',
  styleUrls: ['./get-started.component.scss']
})
export class GetStartedComponent {
  npmInstallCode = `npm install --save @pioneer-code/pioneer-code-angular-chart`;
  yarnInstallCode = `yarn add @pioneer-code/pioneer-code-angular-chart`;

}
