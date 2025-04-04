import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalDetalleFiestaComponent } from './modal-detalle-fiesta.component';

describe('ModalDetalleFiestaComponent', () => {
  let component: ModalDetalleFiestaComponent;
  let fixture: ComponentFixture<ModalDetalleFiestaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalDetalleFiestaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalDetalleFiestaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
