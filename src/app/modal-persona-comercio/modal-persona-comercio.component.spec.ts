import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalPersonaComercioComponent } from './modal-persona-comercio.component';

describe('ModalPersonaComercioComponent', () => {
  let component: ModalPersonaComercioComponent;
  let fixture: ComponentFixture<ModalPersonaComercioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalPersonaComercioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalPersonaComercioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
