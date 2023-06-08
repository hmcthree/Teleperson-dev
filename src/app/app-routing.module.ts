import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component'
import { SignupComponent } from './signup/signup.component'
import { AdminLayoutComponent } from './admin-layout/admin-layout.component'
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component'
import { AddVendorComponent } from './add-vendor/add-vendor.component'
import { ChangePasswordComponent } from './change-password/change-password.component'
import { AnonymousGuard } from './anonymous.guard'
import { AdminGuard } from './admin.guard'
import { VendorHubComponent } from './vendor-hub/vendor-hub.component';
import { MyVendorsComponent } from './vendor-hub/my-vendors/my-vendors.component';
import { OtherVendorsComponent } from './vendor-hub/other-vendors/other-vendors.component';
import { VendorLoungeComponent } from './vendor-lounge/vendor-lounge.component';
import { VendorChairComponent } from './vendor-chair/vendor-chair.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ConciergeComponent } from './concierge/concierge.component';
import { CommunityComponent } from './community/community.component';
import { YouzakComponent } from './youzak/youzak.component';
import { InviteFriendComponent } from './invite-friend/invite-friend.component';
import { SuportComponent } from './suport/suport.component';
import { SettingsComponent } from './settings/settings.component';
import { ProfileComponent } from './profile/profile.component';
import { ManualVendorComponent } from './manual-vendor/manual-vendor.component';
import { RecoverPasswordComponent } from './recover-password/recover-password.component';
import { VendorOverviewComponent } from './vendor-hub/vendor-overview/vendor-overview.component';
import { SearchComponent } from './search/search.component';
import { SeeProfileComponent } from './see-profile/see-profile.component';
const routes: Routes = [
    { path: '', component: LoginComponent, pathMatch: 'full', canActivate: [AnonymousGuard]},
    //Super admin routes goes here
    // {
    //     path: '',
    //     component: SuperAdminLayoutComponent,
    //     canActivate: [SuperAdminGuard],
    //     children: [
    //       { path: 'super-admin-dashboard', component: SuperAdminDashboardComponent, canActivate: [SuperAdminGuard]},
    //       { path: 'add-business', component: AddBusinessComponent, canActivate: [SuperAdminGuard]}
    //     ]
    // },

    // Admin routes goes here here
    {
        path: '',
        component: AdminLayoutComponent,
        canActivate: [AdminGuard],
        children: [
          { path: 'app/dashboard', component: AdminDashboardComponent,canActivate: [AdminGuard] },
          { path: 'app/vendor-overview', component: VendorOverviewComponent,canActivate: [AdminGuard] },
          { path: 'app/vendors', component: AddVendorComponent,canActivate: [AdminGuard] },
          { path: 'app/concierge', component: ConciergeComponent,canActivate: [AdminGuard] },
          { path: 'app/community', component: CommunityComponent,canActivate: [AdminGuard] },
          { path: 'app/youzak', component: YouzakComponent,canActivate: [AdminGuard] },
          { path: 'app/invite-friend', component: InviteFriendComponent,canActivate: [AdminGuard] },
          { path: 'app/support', component: SuportComponent,canActivate: [AdminGuard] },
          { path: 'app/settings', component: SettingsComponent,canActivate: [AdminGuard] },
          { path: 'app/profile', component: ProfileComponent,canActivate: [AdminGuard] },
          { path: 'app/community-profile/:userId', component: SeeProfileComponent,canActivate: [AdminGuard] },
          { path: 'app/vendor-lounge', component: VendorLoungeComponent,canActivate: [AdminGuard] },
          { path: 'app/manual', component: ManualVendorComponent,canActivate: [AdminGuard] },
          { path: 'app/vendor-chair', component: VendorChairComponent,canActivate: [AdminGuard] },
          { path: 'app/change-password/:userId', component: ChangePasswordComponent, canActivate: [AdminGuard]},
          { path: 'app/search/:searchTerm', component: SearchComponent, canActivate: [AdminGuard]},
          { path: 'app/vendor-hub', 
            loadChildren: () => import('./vendor-hub/vendor-hub.module').then(mod=>mod.VendorHubModule),
            canActivate: [AdminGuard] },
        ]
    },
    // Agent routes goes here here
    // {
    //     path: '',
    //     component: AgentLayoutComponent,
    //     canActivate: [AgentGuard],
    //     children: [
    //       { path: 'agent/dashboard', component: AgentDashboardComponent, canActivate: [AgentGuard] },
    //     ]
    // },
    // // User routes goes here here
    // {
    //     path: '',
    //     component: UserLayoutComponent,
    //     canActivate: [UserGuard],
    //     children: [
    //       { path: 'user/dashboard', component: UserDashboardComponent, canActivate: [UserGuard] },
    //     ]
    // },
    //Print routs goes here
    // { path: 'print',
    //   outlet: 'print',
    //   component: PrintLayoutComponent,
    //   children: [
    //     { path: 'report/:siteIds', component: CategoryWiseReportPrintComponent,canActivate: [AdminGuard] },
    //     { path: 'transaction/:siteIds', component: TransactionPrintComponent,canActivate: [AdminGuard] },
    //     { path: 'vendors/:siteIds', component: SiteVendorsPrintComponent,canActivate: [AdminGuard] },
    //     { path: 'invoice/:invoiceIds', component: InvoicePrintComponent,canActivate: [AdminGuard] },
    //     { path: 'slip/:slipIds', component: SlipPrintComponent,canActivate: [AdminGuard] }
    //   ], canActivate: [AdminGuard]
    // },

    //no layout routes
    { path: 'login', component: LoginComponent, canActivate: [AnonymousGuard]},
    { path: 'signup/:userId', component: SignupComponent, canActivate: [AnonymousGuard]},
    { path: 'signup', component: SignupComponent, canActivate: [AnonymousGuard]},
    { path: 'recover-passowrd', component: RecoverPasswordComponent, canActivate: [AnonymousGuard]},
    { path: 'change-password/:userId', component: ChangePasswordComponent, canActivate: [AnonymousGuard]},
    // { path: 'home', component: HomeComponent, canActivate: [AnonymousGuard]},
    // { path: 'admin-login', component: AdminLoginComponent, canActivate: [AnonymousGuard]},
    // { path: 'agent-login', component: AgentLoginComponent, canActivate: [AnonymousGuard]},

    // otherwise redirect to home
    { path: '**', pathMatch: 'full', component: PageNotFoundComponent }
    // { path: '**', redirectTo: '' }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
