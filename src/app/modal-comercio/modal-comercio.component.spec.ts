import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalComercioComponent } from './modal-comercio.component';

describe('ModalComercioComponent', () => {
  let component: ModalComercioComponent;
  let fixture: ComponentFixture<ModalComercioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalComercioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalComercioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
