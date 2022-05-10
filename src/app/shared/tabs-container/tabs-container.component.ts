import {
  AfterContentInit,
  Component,
  ContentChildren,
  OnInit,
  QueryList,
} from '@angular/core';
import { TabComponent } from '../tab/tab.component';

@Component({
  selector: 'app-tabs-container',
  templateUrl: './tabs-container.component.html',
  styleUrls: ['./tabs-container.component.scss'],
})
export class TabsContainerComponent implements OnInit, AfterContentInit {
  @ContentChildren(TabComponent) tabs?: QueryList<TabComponent>;

  // @ContentChildren(TabComponent) tabs: QueryList<TabComponent> =
  //   new QueryList();

  constructor() {}

  ngOnInit(): void {}

  ngAfterContentInit(): void {
    // console.log(this.tabs);

    const activeTabs = this.tabs?.filter((tab) => tab.active);

    if (!activeTabs || activeTabs.length === 0) {
      this.selectTab(this.tabs!.first);
    }
  }

  selectTab(tab: TabComponent): boolean {
    this.tabs?.forEach((tab) => {
      tab.active = false;
    });

    tab.active = true;

    return false;
  }
}
