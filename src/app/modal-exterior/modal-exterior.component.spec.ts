import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalExteriorComponent } from './modal-exterior.component';

describe('ModalExteriorComponent', () => {
  let component: ModalExteriorComponent;
  let fixture: ComponentFixture<ModalExteriorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalExteriorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalExteriorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
