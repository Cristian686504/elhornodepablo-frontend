import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalActualizarPerfilComponent } from './modal-actualizar-perfil.component';

describe('ModalActualizarPerfilComponent', () => {
  let component: ModalActualizarPerfilComponent;
  let fixture: ComponentFixture<ModalActualizarPerfilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalActualizarPerfilComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalActualizarPerfilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
