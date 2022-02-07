import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BaseCore, BasePage } from 'src/app/base';
import { DialogComponent } from 'src/app/page/manager/other/maple-story/dialog/dialog.component';
import Swal from 'sweetalert2';
import * as $ from 'jquery';

@Component({
  selector: 'app-maple-story',
  templateUrl: './maple-story.component.html',
  styleUrls: ['./maple-story.component.scss']
})
export class MapleStoryComponent extends BasePage implements OnInit {
  public SAVE_NAME = 'MAPLE-STORY';
  public json = [];
  public coreArr = [];
  public jobList = [];
  public skillList = [];
  public searchSkill = [];
  public coreList = [];
  public searchCore = [];
  public finalCore = [];
  public resultCore = [];
  public showCore = [];
  public queryMsg = '';
  public active = [false, false, false, false, false];
  public initType = 'BEST';
  public isSearch = false;

  constructor(protected core: BaseCore, protected activatedRoute: ActivatedRoute) {
    super(core, activatedRoute);
    this.getAssetsJsonData('maple-story/core').then((res: any) => {
      this.json = res;
      this.json.forEach((item: any) => {
        switch (item.TYPE) {
          case 'CORE_ARR': { this.coreArr = item.DATA; } break;
          case 'JOB': { this.jobList = item.DATA; } break;
        }
      });
    });
  }

  ngOnInit() {
  }

  getOptionClass(type: 'TITLE1' | 'TITLE2' | 'OPTION') {
    switch (type) {
      case 'TITLE1': return 'bg-dark text-white';
      case 'TITLE2': return 'bg-secondary text-white';
      case 'OPTION': return '';
    }
    return '';
  }

  getOptionTitle(data: any) {
    const type = data.TYPE;
    const status = (data.STATUS === 'Y' ? '' : '（尚未開放）');
    const name = data.NAME + status;
    switch (type) {
      case 'TITLE1': return name;
      case 'TITLE2': return '　' + name;
      case 'OPTION': return '　　' + name;
    }
    return name;
  }

  onSelectChange(event: any) {
    this.skillList = [];
    this.coreList = [];
    this.searchSkill = [];
    this.searchCore = [];
    this.finalCore = [];
    this.resultCore = [];
    this.showCore = [];
    this.queryMsg = '';
    this.isSearch = false;
    let skill = [];
    let core = [];
    const job = this.jobList.find((item: any) => (item.TYPE === 'OPTION' && item.VALUE === event));
    const data = this.getLocalStorage(this.SAVE_NAME);
    let haveData = (data !== null && data !== undefined && data.CORE !== null && data.CORE !== undefined);
    const coreData = (haveData ? data.CORE.find((item: any) => (item.JOB === event)) : []);
    // tslint:disable-next-line:max-line-length
    haveData = (job === null || job === undefined || coreData === null || coreData === undefined || job.STATUS !== 'Y' || job.VER !== coreData.VER ? false : haveData);
    this.json.forEach((item: any) => {
      switch (item.TYPE) {
        case 'SKILL': { skill = item.DATA; } break;
        case 'CORE': { core = item.DATA; } break;
      }
    });
    skill.forEach((item: any) => {
      if (item.VALUE === event) {
        this.skillList = item.LIST;
      }
    });
    if (haveData) {
      coreData.SKILL.forEach((item1: string) => {
        const temp = (this.skillList.filter((item2: any) => (item2.IMG === item1)));
        if (temp.length > 0) {
          this.searchSkill.push(temp[0]);
        }
      });
    }
    core.forEach((item: any) => {
      if (item.VALUE === event) {
        this.coreList = item.LIST;
      }
    });
    this.coreList.forEach((item1: any) => {
      item1.ACTIVE = false;
      const add = { LAYER1: item1.LAYER1, LIST: [], ACTIVE: false };
      if (haveData) {
        const temp1 = coreData.CORE.find((item2: any) => (item2.LAYER1 === item1.LAYER1));
        if (temp1 !== null && temp1 !== undefined) {
          temp1.LIST.forEach((item3: string) => {
            const temp2 = (item1.LIST.filter((item4: any) => (item4.IMG === item3)));
            if (temp2.length > 0) {
              add.LIST.push(temp2[0]);
            }
          });
        }
      }
      this.searchCore.push(add);
    });
  }

  searchSkillChange(type: 'ADD' | 'SUB', data: any, idx: number) {
    switch (type) {
      case 'ADD':
        {
          const tempIdx = (this.searchSkill.findIndex((item: any) => (item.IMG === data.IMG)));
          if (tempIdx < 0) {
            this.searchSkill.push(data);
          } else {
            this.searchSkill.splice(tempIdx, 1);
          }
        }
        break;
      case 'SUB': { this.searchSkill.splice(idx, 1); } break;
    }
  }

  isFilter(type: 'SKILL' | 'CORE', idx: number, img: string) {
    switch (type) {
      case 'SKILL': return (this.searchSkill.findIndex((item: any) => (item.IMG === img)) >= 0);
      case 'CORE': return (this.searchCore[idx].LIST.findIndex((item: any) => (item.IMG === img)) >= 0);
    }
    return false;
  }

  isShow(type: 'SKILL' | 'CORE', img: string) {
    switch (type) {
      case 'SKILL': return (this.searchSkill.findIndex((item: any) => (item.IMG === img)) >= 0);
      case 'CORE':
        {
          const arr = img.split('_');
          let show = true;
          arr.forEach((str: string) => {
            if (this.searchSkill.findIndex((item: any) => (item.IMG === str)) < 0) {
              show = false;
            }
          });
          return show;
        }
    }
    return false;
  }

  getSkill(img: string) {
    const temp = (this.skillList.filter((item: any) => (item.IMG === img)));
    return (temp.length <= 0 ? '' : temp[0]);
  }

  searchCoreChange(type: 'ADD' | 'SUB', data: any, layer1: string, idx: number) {
    switch (type) {
      case 'ADD':
        {
          const itemIdx = (this.searchCore.findIndex((item: any) => (item.LAYER1 === layer1)));
          if (itemIdx >= 0) {
            const tempIdx = (this.searchCore[itemIdx].LIST.findIndex((item: any) => (item.IMG === data.IMG)));
            if (tempIdx < 0) {
              this.searchCore[itemIdx].LIST.push(data);
            } else {
              this.searchCore[itemIdx].LIST.splice(tempIdx, 1);
            }
          }
        }
        break;
      case 'SUB':
        {
          const itemIdx = (this.searchCore.findIndex((item: any) => (item.LAYER1 === layer1)));
          if (itemIdx >= 0) {
            this.searchCore[itemIdx].LIST.splice(idx, 1);
          }
        }
        break;
    }
  }

  getCoreLen(list: []) {
    return list.filter((item1: any) => {
      const arr = item1.IMG.split('_');
      let show = true;
      arr.forEach((str: string) => {
        if (this.searchSkill.findIndex((item2: any) => (item2.IMG === str)) < 0) {
          show = false;
        }
      });
      return show;
    }).length;
  }

  onTypeChange(event: any) {
    this.queryMsg = (!this.isSearch || this.getShowCore(event).length > 0 ? '' : '自身核心不足，請多加努力！');
  }

  onSave(form: any) {
    const v = form.value;
    if (this.saveData(v.JOB, true)) {
      Swal.fire({
        title: this.getTranslate('SYSTEM.001'),
        text: this.getTranslate('SUCCESS.006'),
        icon: 'success',
        allowOutsideClick: false,
        showConfirmButton: false,
        showCloseButton: true,
      });
    }
  }

  saveData(job: string, showMsg: boolean) {
    const jobData = this.jobList.find((item: any) => (item.VALUE === job));
    let msg = '';
    if (job === null || job === undefined || job === '') {
      msg = '請確實選擇職業';
    } else {
      if (jobData === null || jobData === undefined) {
        msg = '查無您選擇的職業';
      } else if (jobData.STATUS !== 'Y') {
        msg = '此職業尚未開放';
      } else if (jobData.VER === null || jobData.VER === undefined || jobData.VER === '') {
        msg = '查無資料版本號，請清除網頁快取後再試一次';
      }
    }
    if (msg !== '') {
      if (showMsg) {
        Swal.fire({
          title: this.getTranslate('SYSTEM.001'),
          text: msg,
          icon: 'error',
          allowOutsideClick: false,
          showConfirmButton: false,
          showCloseButton: true,
        });
      }
      return false;
    } else {
      const save = { JOB: job, VER: jobData.VER, SKILL: [], CORE: [] };
      this.searchSkill.forEach((item: any) => {
        save.SKILL.push(item.IMG);
      });
      this.searchCore.forEach((item1: any) => {
        const core = { LAYER1: item1.LAYER1, LIST: [] };
        item1.LIST.forEach((item2: any) => {
          core.LIST.push(item2.IMG);
        });
        save.CORE.push(core);
      });
      let data = this.getLocalStorage(this.SAVE_NAME);
      if (data === null || data === undefined) {
        data = { CORE: [] };
      }
      const idx = data.CORE.findIndex((item: any) => (item.JOB === job));
      if (idx < 0) {
        data.CORE.push(save);
      } else {
        data.CORE[idx] = save;
      }
      this.setLocalStorage(this.SAVE_NAME, data);
      return true;
    }
  }

  onClear(form: any) {
    this.searchSkill = [];
    this.searchCore.forEach((item: any) => {
      item.LIST = [];
    });
    this.finalCore = [];
    this.resultCore = [];
    this.showCore = [];
    this.queryMsg = '';
    this.isSearch = false;
    const v = form.value;
    if (this.saveData(v.JOB, false)) {
      Swal.fire({
        title: this.getTranslate('SYSTEM.001'),
        text: this.getTranslate('SUCCESS.004'),
        icon: 'success',
        allowOutsideClick: false,
        showConfirmButton: false,
        showCloseButton: true,
      });
    }
  }

  onSubmit(form: any): void {
    if (form.valid) {
      const v = form.value;
      const QUANTITY = Number(v.QUANTITY);
      let errorMsg = '';
      if (QUANTITY > this.searchSkill.length) {
        errorMsg = '核心數不可大於要組合的技能數';
      }
      if (this.searchSkill.length < 3) {
        errorMsg = '請至少選擇3種要組合的技能';
      }
      if (errorMsg === '') {
        this.finalCore = [];
        this.resultCore = [];
        this.showCore = [];
        this.queryMsg = '';
        this.searchFinalCore();
        this.checkFinalCore(this, QUANTITY, 0, 0, []);
        this.checkShowCore();
        this.queryMsg = (this.getShowCore(v.TYPE).length > 0 ? '' : '自身核心不足，請多加努力！');
        this.isSearch = true;
        Swal.fire({
          title: this.getTranslate('SYSTEM.001'),
          text: this.getTranslate('SUCCESS.013'),
          icon: 'success',
          allowOutsideClick: false,
          showConfirmButton: false,
          showCloseButton: true,
        });
      } else {
        Swal.fire({
          title: this.getTranslate('SYSTEM.001'),
          text: errorMsg,
          icon: 'error',
          allowOutsideClick: false,
          showConfirmButton: false,
          showCloseButton: true,
        });
      }
    } else {
      Swal.fire({
        title: this.getTranslate('SYSTEM.001'),
        text: this.getTranslate('ERROR.003'),
        icon: 'error',
        allowOutsideClick: false,
        showConfirmButton: false,
        showCloseButton: true,
      });
    }
  }

  searchFinalCore() {
    this.searchSkill.forEach((item1: any, idx1: number) => {
      this.searchSkill.forEach((item2: any, idx2: number) => {
        if (item1.IMG !== item2.IMG) {
          this.searchSkill.forEach((item3: any, idx3: number) => {
            if (item1.IMG !== item3.IMG && item2.IMG !== item3.IMG) {
              const itemIdx1 = (this.searchCore.findIndex((item: any) => (item.LAYER1 === item1.IMG)));
              if (itemIdx1 >= 0) {
                const temp = this.searchCore[itemIdx1].LIST.filter((item: any) => (item.IMG === item2.IMG + '_' + item3.IMG));
                if (temp.length > 0) {
                  const itemIdx2 = (this.finalCore.findIndex((item: any) => (item.LAYER1 === item1.IMG)));
                  if (itemIdx2 >= 0) {
                    this.finalCore[itemIdx2].LIST.push(temp[0]);
                  } else {
                    const data = { LAYER1: item1.IMG, LIST: [] };
                    data.LIST.push(temp[0]);
                    this.finalCore.push(data);
                  }
                }
              }
            }
          });
        }
      });
    });
  }

  checkFinalCore(obj: any, quantity: number, idx: number, count: number, res: any) {
    obj.finalCore.forEach((item1: any, idx1: number) => {
      if (idx1 >= idx) {
        item1.LIST.forEach((item2: any) => {
          while (res.length > count) {
            res.splice(res.length - 1, 1);
          }
          res.push(item1.LAYER1 + '_' + item2.IMG);
          if (res.length >= quantity) {
            if (obj.checkResult(res)) {
              obj.resultCore.push(obj.checkLevel(res));
            }
          } else if (quantity > count + 1) {
            obj.checkFinalCore(obj, quantity, idx1 + 1, count + 1, res);
          }
        });
      }
    });
  }

  checkResult(res: any) {
    let retBool = true;
    this.searchSkill.some((item1: any) => {
      const idx = (res.findIndex((item2: any) => (item2.indexOf(item1.IMG) >= 0)));
      if (idx < 0) {
        retBool = false;
        return true;
      }
    });
    return retBool;
  }

  checkLevel(res: any) {
    const temp = { LEVEL: 1, LIST: [] };
    res.forEach((str: string) => {
      temp.LIST.push(str);
    });
    let bool0 = false;
    let bool1 = false;
    let bool3 = false;
    this.searchSkill.forEach((item1: any) => {
      let count = 0;
      res.forEach((item2: string) => {
        if (item2.indexOf(item1.IMG) >= 0) {
          count++;
        }
      });
      if (count <= 0) {
        bool0 = true;
      } else if (count < 2) {
        bool1 = true;
      } else if (count > 2) {
        bool3 = true;
      }
    });
    if (!bool0 && !bool1 && !bool3) {
      temp.LEVEL = 1;
    } else if (!bool0 && !bool1 && bool3) {
      temp.LEVEL = 2;
    } else if (!bool0 && bool1 && bool3) {
      temp.LEVEL = 3;
    } else if (!bool0) {
      temp.LEVEL = 4;
    } else {
      temp.LEVEL = 5;
    }/* else if (!bool0 && (bool1 && !bool3 || !bool1)) {
      temp.LEVEL = 2;
    } else if (!bool0) {
      temp.LEVEL = 3;
    } else {
      temp.LEVEL = 4;
    }*/
    return temp;
  }

  checkShowCore() {
    this.resultCore.forEach((item1: any) => {
      const data = { LIST: [], LEVEL: item1.LEVEL };
      item1.LIST.forEach((item2: any) => {
        const arr = item2.split('_');
        const itemIdx1 = (this.coreList.findIndex((item: any) => (item.LAYER1 === arr[0])));
        if (itemIdx1 >= 0) {
          const temp1 = (this.coreList[itemIdx1].LIST.filter((item: any) => (item.IMG === arr[1] + '_' + arr[2])));
          if (temp1.length > 0) {
            const add = { NAME: temp1[0].NAME, IMG_SOR: arr[0] + '/' + arr[1] + '_' + arr[2] + '.png' };
            data.LIST.push(add);
          }
        }
      });
      this.showCore.push(data);
    });
  }

  getShowCore(event: string) {
    switch (event) {
      case 'BEST': { return this.showCore.filter((item: any) => (item.LEVEL === 1)); }
      case 'GOOD': { return this.showCore.filter((item: any) => (item.LEVEL === 2)); }
      case 'SOSO': { return this.showCore.filter((item: any) => (item.LEVEL === 3)); }
      case 'BAD': { return this.showCore.filter((item: any) => (item.LEVEL === 4)); }
      case 'ALL': { return this.showCore.filter((item: any) => (item.LEVEL !== 5)); }
    }
    return [];
  }

  openDlg() {
    this.openDialog(DialogComponent, {
      disableClose: true,
      width: this.bigSize ? '80vw' : '95vw',
      height: '90vh',
      maxWidth: this.bigSize ? '80vw' : '95vw',
      data: {}
    });
  }

  clipboard(id: string) {
    var content = document.getElementById(id);
    var range = document.createRange();
    range.selectNodeContents(content);
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand('copy');
    selection.removeAllRanges();
    var className = 'p-1 m-0 position-absolute copy-tips alert alert-dark fade';
    var tipsId = '#tips_' + id;
    $(tipsId).attr('class', className + ' show');
    setTimeout(() => { $(tipsId).attr('class', className); }, 1000);
  }
}
