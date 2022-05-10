import { Injectable } from '@angular/core';
import { IModal } from '../models/modal.model';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private modals: IModal[] = [];

  constructor() {}

  register(id: string): void {
    this.modals.push({
      id: id,
      visible: false,
    });
  }

  unregister(id: string) {
    this.modals = this.modals.filter((element) => element.id !== id);
  }

  isModalOpen(id: string): boolean {
    // return <boolean>this.modals.find((element) => element.id === id)?.visible;
    // return this.modals.find((element) => element.id === id)?.visible as boolean;
    // return Boolean(this.modals.find((element) => element.id === id)?.visible);
    return !!this.modals.find((element) => element.id === id)?.visible;
  }

  toggleModal(id: string): void {
    // this.visible = !this.visible;
    const modal = this.modals.find((element) => element.id === id);

    if (modal) {
      modal.visible = !modal.visible;
    }
  }
}
