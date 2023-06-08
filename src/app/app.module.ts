import { NgModule } from '@angular/core';
import { BrowserModule, HAMMER_GESTURE_CONFIG, HammerModule, HammerGestureConfig } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { LoginComponent } from './login/login.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { AdminSidenavComponent } from './admin-sidenav/admin-sidenav.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import {MatSortModule} from '@angular/material/sort';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {MatListModule} from '@angular/material/list';
import {MatTreeModule} from '@angular/material/tree';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatBadgeModule} from '@angular/material/badge';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatCardModule} from '@angular/material/card';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import { AuthInterceptor } from './auth.interceptor';
import { DatePipe } from '@angular/common';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import {ObservablesService} from './observables.service';
import { AdminHeaderComponent } from './admin-header/admin-header.component';
import { SignupComponent } from './signup/signup.component';
import { AddVendorComponent } from './add-vendor/add-vendor.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { MyVendorsComponent } from './vendor-hub/my-vendors/my-vendors.component';
import { OtherVendorsComponent } from './vendor-hub/other-vendors/other-vendors.component';
import { VendorHubComponent } from './vendor-hub/vendor-hub.component';
import { VendorOverviewComponent } from './vendor-hub/vendor-overview/vendor-overview.component';
import { VendorLoungeComponent } from './vendor-lounge/vendor-lounge.component';
import { DialogView } from './vendor-lounge/vendor-lounge.component';
import { NgxPlaidLinkModule } from 'ngx-plaid-link';
import { VendorChairComponent } from './vendor-chair/vendor-chair.component';
import { HeaderComponent } from './header/header.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ConciergeComponent } from './concierge/concierge.component';
import { CommunityComponent } from './community/community.component';
import { YouzakComponent } from './youzak/youzak.component';
import { InviteFriendComponent } from './invite-friend/invite-friend.component';
import { SuportComponent } from './suport/suport.component';
import { SettingsComponent } from './settings/settings.component';
import {PlatformModule} from '@angular/cdk/platform';
import { CommunityVendorsComponent } from './vendor-hub/community-vendors/community-vendors.component';
import { RecommendedVendorsComponent } from './vendor-hub/recommended-vendors/recommended-vendors.component';
import { ProfileComponent } from './profile/profile.component';
import { ManualVendorComponent } from './manual-vendor/manual-vendor.component';
import {MatSliderModule} from '@angular/material/slider';
import { RightSidenavComponent } from './right-sidenav/right-sidenav.component';
import { RecoverPasswordComponent } from './recover-password/recover-password.component';
import { FooterComponent } from './footer/footer.component';
import { SearchComponent } from './search/search.component';
import { CommunityPageComponent } from './community-page/community-page.component';
import { SeeProfileComponent } from './see-profile/see-profile.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AdminDashboardComponent,
    AdminLayoutComponent,
    AdminSidenavComponent,
    AdminHeaderComponent,
    SignupComponent,
    AddVendorComponent,
    ChangePasswordComponent,
    MyVendorsComponent,
    OtherVendorsComponent,
    VendorHubComponent,
    VendorOverviewComponent,
    VendorLoungeComponent,
    DialogView,
    VendorChairComponent,
    HeaderComponent,
    PageNotFoundComponent,
    ConciergeComponent,
    CommunityComponent,
    YouzakComponent,
    InviteFriendComponent,
    SuportComponent,
    SettingsComponent,
    CommunityVendorsComponent,
    RecommendedVendorsComponent,
    ProfileComponent,
    ManualVendorComponent,
    RightSidenavComponent,
    RecoverPasswordComponent,
    SearchComponent,
    FooterComponent,
    CommunityPageComponent,
    SeeProfileComponent
  ],
  imports: [
    BrowserModule,
    HammerModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    MatListModule,
    ReactiveFormsModule,
    NgxPlaidLinkModule,
    PlatformModule,
    MatCardModule,
    MatChipsModule,MatIconModule,MatSlideToggleModule,MatTooltipModule,ScrollingModule,MatSliderModule,
    MatDialogModule, MatTabsModule,HttpClientModule, MatAutocompleteModule, MatRadioModule,MatProgressSpinnerModule,
    MatDatepickerModule,MatNativeDateModule, MatSelectModule, MatButtonModule, MatCheckboxModule,MatBadgeModule,MatGridListModule,
    MatInputModule,MatPaginatorModule, MatTreeModule, MatProgressBarModule, MatExpansionModule, MatSortModule,MatTableModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the app is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [HttpClient,DatePipe,{provide: MAT_DATE_LOCALE, useValue: 'en-GB'},{provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true, deps: [ObservablesService]}, { provide: HAMMER_GESTURE_CONFIG, useClass: HammerGestureConfig }],
  bootstrap: [AppComponent]
})
export class AppModule { }
