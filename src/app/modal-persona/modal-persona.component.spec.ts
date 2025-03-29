import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalPersonaComponent } from './modal-persona.component';

describe('ModalPersonaComercioComponent', () => {
  let component: ModalPersonaComponent;
  let fixture: ComponentFixture<ModalPersonaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalPersonaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalPersonaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
