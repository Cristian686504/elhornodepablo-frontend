import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalBeneficioComponent } from './modal-beneficio.component';

describe('ModalBeneficioComponent', () => {
  let component: ModalBeneficioComponent;
  let fixture: ComponentFixture<ModalBeneficioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalBeneficioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalBeneficioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
