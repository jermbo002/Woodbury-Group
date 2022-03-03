/**
 * Copyright 2020 Select Interactive, LLC. All rights reserved.
 * @author: The Select Interactive dev team (www.select-interactive.com)
*/
import app from './app';
import { $, $$ } from '../utils/$';
import FBAuth from '../firebase/authentication';
import { Toast, toast } from '../components/toast';
import LoadingSpinner from '../components/loading-spinner';

( async function( doc ) {

    class Program {
        static main( ...args ) {
            new SignInMgr();
        }
    }

    class SignInMgr {
        static get MODES() {
            return {
                SIGN_IN: 'sign-in',
                SIGN_UP: 'sign-up',
                FORGOT_PWD: 'forgot-pwd'
            };
        }

        constructor() {
            this.firebase = new FBAuth();
            this.root = $( '#js-form-sign-in' );
            this.fields = $$( 'input', this.root );
            this.rowName = $( '#js-row-name', this.root );
            this.rowPwd = $( '#js-row-pwd', this.root );
            this.rowForgot = $( '#js-row-forgot-pwd', this.root );
            this.btnForgot = $( '#js-btn-forgot', this.root );
            this.rowError = $( '#js-row-error', this.root );
            this.btnSignIn = $( '#js-btn-sign-in', this.root );
            this.btnNoAcct = $( '#js-btn-no-account', this.root );
            this.btnGoog = $( '#js-btn-sign-in-goog', this.root );
            this.isProcessing = false;
            this.addEvents();
        }

        addEvents() {
            this.root.addEventListener( 'submit', e => this.onFormSubmit( e ) );

            this.fields.forEach( field => field.addEventListener( 'keypress', e => {
                if ( e.keyCode === 13 ) {
                    this.onSignInClick( e );
                }
            } ) );

            this.btnNoAcct.addEventListener( 'click', e => this.onNoAcctClick( e ) );
            this.btnSignIn.addEventListener( 'click', e => this.onSignInClick( e ) );

            this.btnGoog.addEventListener( 'click', e => {
                e.preventDefault();
                window.localStorage.setItem( 'is-goog-signin', JSON.stringify( { pending: true } ) );
                this.firebase.signInWithGoogle();
            } );

            this.btnForgot.addEventListener( 'click', e => this.onForgotClick( e ) );
        }

        onNoAcctClick( e ) {
            e.preventDefault();

            // Current mode
            const mode = this.root.getAttribute( 'data-mode' );

            if ( mode === SignInMgr.MODES.SIGN_IN ) {
                // Updating to Sign Up
                this.updateForSignUp();
            }
            else {
                // Updating to Sign In
                this.updateForSignIn();
            }

            toast.hideAll();
        }

        onForgotClick( e ) {
            e.preventDefault();
            this.root.setAttribute( 'data-mode', SignInMgr.MODES.FORGOT_PWD );
            this.rowName.classList.add( 'hidden' );
            this.rowPwd.classList.add( 'hidden' );
            this.rowForgot.classList.add( 'hidden' );
            this.btnSignIn.querySelector( 'span' ).textContent = 'Send Password Reset';
            this.btnNoAcct.textContent = 'Login';
        }

        updateForSignUp() {
            this.root.setAttribute( 'data-mode', SignInMgr.MODES.SIGN_UP );
            this.rowName.classList.remove( 'hidden' );
            this.rowForgot.classList.add( 'hidden' );
            this.btnSignIn.querySelector( 'span' ).textContent = 'Sign Up';
            this.btnNoAcct.textContent = 'Already have an account?';
            this.fields[0].focus();
        }

        updateForSignIn() {
            this.root.setAttribute( 'data-mode', SignInMgr.MODES.SIGN_IN );
            this.rowName.classList.add( 'hidden' );
            this.rowPwd.classList.remove( 'hidden' );
            this.rowForgot.classList.remove( 'hidden' );
            this.btnSignIn.querySelector( 'span' ).textContent = 'Sign In';
            this.btnNoAcct.textContent = 'Don\'t have an account?';
            this.fields[1].focus();
        }

        async onSignInClick( e ) {
            e.preventDefault();

            if ( this.isProcessing ) {
                return;
            }

            this.isProcessing = true;

            // Current mode
            const mode = this.root.getAttribute( 'data-mode' );

            let isValid = true;
            const data = {};

            this.fields.some( ( field, i ) => {
                const val = field.value.trim();

                if ( mode === SignInMgr.MODES.SIGN_UP && val === '' ) {
                    isValid = false;
                    return true;
                }
                else if ( mode === SignInMgr.MODES.SIGN_IN && i > 0 && val === '' ) {
                    isValid = false;
                    return true;
                }
                else if ( mode === SignInMgr.MODES.FORGOT_PWD && i === 1 && val === '' ) {
                    isValid = false;
                    return true;
                }

                data[field.getAttribute( 'name' )] = val;
            } );

            if ( !isValid ) {
                toast.show( Toast.STATUS.ERROR, '* All fields are required.', true, true );
                this.isProcessing = false;
                return;
            }

            this.btnSignIn.lbl = this.btnSignIn.innerHTML;
            this.btnSignIn.innerHTML = LoadingSpinner;

            if ( mode === SignInMgr.MODES.SIGN_UP ) {
                toast.show( Toast.STATUS.PROCESSING, 'Creating your account...', true, true );

                try {
                    await this.firebase.signUp( data.name, data.email, data.pwd );
                }
                catch ( e ) {
                    toast.show( Toast.STATUS.ERROR, e.message || 'Unable to create the account at this time, please try again.', true, true );
                    this.isProcessing = false;
                    this.btnSignIn.innerHTML = this.btnSignIn.lbl;
                }
            }
            else if ( mode === SignInMgr.MODES.SIGN_IN ) {
                toast.show( Toast.STATUS.PROCESSING, 'Attempting to log in...', true, true );

                try {
                    await this.firebase.signIn( data.email, data.pwd );
                }
                catch ( e ) {
                    toast.show( Toast.STATUS.ERROR, 'Unable to login with the email and password. Please check your credentials and try again.', true, true );
                    this.isProcessing = false;
                    this.btnSignIn.innerHTML = this.btnSignIn.lbl;
                }
            }
            else if ( mode === SignInMgr.MODES.FORGOT_PWD ) {
                toast.show( Toast.STATUS.PROCESSING, `Sending a password reset to ${data.email}...`, true, true );

                try {
                    await fetch( '/api/v1/user/pwdReset', {
                        body: JSON.stringify( {
                            email: data.email
                        } ),
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        method: 'POST'
                    } );

                    toast.show( Toast.STATUS.SUCCESS, `A password reset has been sent to ${data.email}`, false, true );
                    this.updateForSignIn();
                }
                catch ( e ) {
                    toast.show( Toast.STATUS.ERROR, e, true, true );
                    console.error( 'Error resetting password.', e );
                    this.btnSignIn.innerHTML = this.btnSignIn.lbl;
                }
                finally {
                    this.isProcessing = false;
                }
            }
        }
    }

    try {
        await app.init();
        Program.main();
    }
    catch ( e ) { console.error( e ); }

}( document ) );