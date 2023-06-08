import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommunityVendorsComponent } from './community-vendors/community-vendors.component';
import { MyVendorsComponent } from './my-vendors/my-vendors.component';
import { OtherVendorsComponent } from './other-vendors/other-vendors.component';
import { RecommendedVendorsComponent } from './recommended-vendors/recommended-vendors.component';
import { VendorHubComponent } from './vendor-hub.component';
import { VendorOverviewComponent } from './vendor-overview/vendor-overview.component';

const routes: Routes = [
  {
    path: '',
    component: VendorHubComponent,
    children: [
      {
        path: 'my-vendors',
        component: MyVendorsComponent,
      },
      {
        path: 'vendor-overview',
        component: VendorOverviewComponent,
      },
      {
        path: 'other-vendors',
        component: OtherVendorsComponent,
      },
      {
        path: 'community-vendors',
        component: CommunityVendorsComponent,
      },
      {
        path: 'recommended-vendors',
        component: RecommendedVendorsComponent,
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VendorHubRoutingModule { }
