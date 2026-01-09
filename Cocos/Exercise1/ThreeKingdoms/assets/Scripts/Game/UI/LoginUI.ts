import { _decorator, Component, Node } from 'cc';
import { BaseView } from '../../Core/BaseView';
const { ccclass, property } = _decorator;

@ccclass('LoginUI')
export class LoginUI extends BaseView {
    
    protected onOpen(){
        this.addGlobalEvent('loginProxy.getPlayerBaseInfo', this.enterGame, this);    
    }

    protected onButtonClicked(btnName: string){
        switch(btnName){
            
        }
    }

    private enterGame(){

    }
}

