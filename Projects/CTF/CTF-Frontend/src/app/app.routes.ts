import { NgModule } from '@angular/core';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/AdminGuard.guard';
import { UserGuard } from './guards/UserGuard.guard';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { UserMenuComponent } from './user-menu/user-menu.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { ContestPageComponent } from './contest-page/contest-page.component';
import { UserProfileACComponent } from './user-profile-ac/user-profile-ac.component';
import { AdminContestComponent } from './admin-contest/admin-contest.component';
import { AdminProfileComponent } from './admin-profile/admin-profile.component';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';
import { ModifyContestComponent } from './modify-contest/modify-contest.component';
import { AddContestComponent } from './add-contest/add-contest.component';
import { AddStudentComponent } from './add-student/add-student.component';
import { EditStudentComponent } from './edit-student/edit-student.component';
import { AddFlagComponent } from './add-flag/add-flag.component';
import { UNAUTHORIZEDComponent } from './unauthorized/unauthorized.component';
import { CreateImageComponent } from './create-image/create-image.component';

export const routes: Routes = [
    {
        path:'',
        component: LoginComponent,
        title: 'Login',
    },

    {
        path: 'user-menu',
        component: UserMenuComponent,
        title: 'User Menu',
        canActivate: [AuthGuard, UserGuard]
    },

    {
        path: 'user-profile',
        component: UserProfileComponent,
        title: 'User Profile',
        canActivate: [AuthGuard, UserGuard]
    },

    {
        path: 'contest-page',
        component: ContestPageComponent,
        title: 'Contest Page',
        canActivate: [AuthGuard, UserGuard]
    },

    {
        path: 'user-profileAC',
        component: UserProfileACComponent,
        title: 'User Profile',
        canActivate: [AuthGuard, UserGuard]
    },

    {
        path: 'admin-contest',
        component: AdminContestComponent,
        title: 'Admin Contest',
        canActivate: [AuthGuard, AdminGuard]
    },

    {
        path: 'admin-profile',
        component: AdminProfileComponent,
        title: 'Admin Profile',
        canActivate: [AuthGuard, AdminGuard]
    },

    {
        path: 'leaderboard',
        component: LeaderboardComponent,
        title: 'Leaderboard'
    },

    {
        path: 'modify-contest',
        component: ModifyContestComponent,
        title: 'Modify Contest',
        canActivate: [AuthGuard, AdminGuard]
    },

    {
        path: 'add-contest',
        component: AddContestComponent,
        title: 'Add Contest',
        canActivate: [AuthGuard, AdminGuard]
    },

    {
        path: 'add-student',
        component: AddStudentComponent,
        title: 'Add Student',
        canActivate: [AuthGuard, AdminGuard]
    },

    {
        path: 'edit-student',
        component: EditStudentComponent,
        title: 'Edit Student',
        canActivate: [AuthGuard, AdminGuard]
    },

    {
        path: 'add-flag',
        component: AddFlagComponent,
        title: 'Add Flag',
        canActivate: [AuthGuard, AdminGuard]
    },

    {
        path: 'unauthorized',
        component: UNAUTHORIZEDComponent,
        title: 'You think youre slick eh?'
    },

    {
        path: 'create-image',
        component: CreateImageComponent,
        title: 'Create Image'
    }
    
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})

export class AppRoutingModule{}
