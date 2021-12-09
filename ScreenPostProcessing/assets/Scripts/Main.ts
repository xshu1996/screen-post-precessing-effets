/**
 * @author xshu
 * @version 0.0.1
 * @description ...
 */

import { ScreenPostProcessing, EffectType } from "./ScreenPostProcessing";

const { ccclass, property } = cc._decorator;

const INTERACTION_UI_Z_INDEX = 1;

@ccclass
class Main extends cc.Component
{

    @property(cc.Button)
    public p_btnShowPage: cc.Button = null;

    @property(cc.Toggle)
    public p_togRealTimeRendering: cc.Toggle = null;

    @property(cc.Slider)
    public p_sliderModifyParam: cc.Slider = null;

    @property(cc.ToggleContainer)
    public p_tgSelectEffect: cc.ToggleContainer = null;

    @property({
        type: cc.Sprite,
        tooltip: "shader 进度条"
    })
    public p_proText: cc.Sprite = null;

    @property({
        type: cc.Float,
        tooltip: "进度条速度"
    })
    public proSpeed: number = 5;

    @property([cc.Button])
    public btnProgressCtl: cc.Button[] = [];

    private _renderList: cc.Node[] = [];

    private _progressIncrement: number = 0;

    private _curProgress: number = 0;
    
    public get curProgress() : number {
        return this._curProgress;
    }

    public set curProgress(v : number) {
        // -0.05 是振幅的大小，如果填0的话，当进度为0时还会出现波浪
        this._curProgress = cc.misc.clampf(v, -0.05, 1);
        if (this._curProgress === -0.05)
        {
            cc.log("进度条已清空");
            // this._progressIncrement = 0;
            this._progressIncrement = -this._progressIncrement;
        }
        if (this._curProgress === 1)
        {
            cc.log("进度条已满");
            // this._progressIncrement = 0;
            this._progressIncrement = -this._progressIncrement;
        }
    }

    protected onLoad(): void
    {
        this.p_btnShowPage.node.zIndex = INTERACTION_UI_Z_INDEX;
        this.p_togRealTimeRendering.node.zIndex = INTERACTION_UI_Z_INDEX;
        this.p_sliderModifyParam.node.zIndex = INTERACTION_UI_Z_INDEX;
        this.p_tgSelectEffect.node.zIndex = INTERACTION_UI_Z_INDEX;

        this._refreshUIVisible();

        this._addUIEvent();
        this._progressIncrement = this.proSpeed;
    }

    private _addUIEvent(): void
    {
        this.p_btnShowPage.node.on('click', () =>
        {
            const recycleImg = ScreenPostProcessing.getRecycleShotTexture();
            const shotNode = ScreenPostProcessing.getScreenShotNode(cc.Canvas.instance.node, true, recycleImg);

            const dlg = new cc.Node('Dialog');
            shotNode.on(cc.Node.EventType.TOUCH_END, (event: cc.Event.EventTouch) =>
            {
                event.stopPropagation();
                dlg.destroy();
                let index: number = this._renderList.indexOf(shotNode);
                if (index >= 0) this._renderList.splice(index, 1);
            }, this);
            cc.director.getScene().addChild(dlg);
            dlg.setPosition(cc.v2(cc.visibleRect.width / 2, cc.visibleRect.height / 2));
            dlg.addChild(shotNode);
            if (this.p_togRealTimeRendering.isChecked)
            {
                this._renderList.push(shotNode);
            } else
            {
                // 把 BlurNormal.effect blurRadius 的值改的特别大， 执不执行下面这一行代码 FPS的差距就体现出来了
                ScreenPostProcessing.reRenderNode(shotNode);
            }
        }, this);

        this.p_sliderModifyParam.node.on('slide', (event) =>
        {
            let val: number = this.p_sliderModifyParam.progress * 8 - 4;
            ScreenPostProcessing.getInstance().p_mtlPencilSketch.setProperty('uIntensity', val);
        }, this);

        this.p_tgSelectEffect.toggleItems.forEach((ele, index) =>
        {
            ele.node.on('toggle', () =>
            {
                ScreenPostProcessing.setEffectType(index);
                this._refreshUIVisible();
            }, this);
        });

        this.btnProgressCtl.forEach((btn, idx) => {
            btn.node.on("click", () => {
                this._progressIncrement = (idx - 1) * this.proSpeed;
            }, this);
        });
    }

    private _refreshUIVisible(): void
    {
        this.p_sliderModifyParam.node.active = ScreenPostProcessing.getEffectType() === EffectType.PencilSketch;
    }

    protected update(dt: number): void
    {
        this._renderList.forEach(ele =>
        {
            let texture = ScreenPostProcessing.getRenderTexture({
                renderNode: cc.Canvas.instance.node,
                frameSize: cc.size(Math.ceil(cc.visibleRect.width), Math.ceil(cc.visibleRect.height))
            });

            ele.getComponent(cc.Sprite).spriteFrame.setTexture(texture);
            ele.getComponent(cc.Sprite)._updateMaterial();
        });

        if (this._progressIncrement !== 0)
        {
            this.curProgress += this._progressIncrement;
            this._controlProgress(this.curProgress);
        }
    }

    private _controlProgress(increment: number): void
    {
        if (!cc.isValid(this.p_proText)) return;
        const WAVE_MTL: cc.Material = this.p_proText.getMaterial(0);
        WAVE_MTL.setProperty("offset", increment);
    }
}
export = Main;