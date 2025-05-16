import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiestasAdminComponent } from './fiestas-admin.component';

describe('FiestasAdminComponent', () => {
  let component: FiestasAdminComponent;
  let fixture: ComponentFixture<FiestasAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiestasAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FiestasAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
