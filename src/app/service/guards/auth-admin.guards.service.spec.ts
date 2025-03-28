import { TestBed } from '@angular/core/testing';

import { AuthAdminGuardsService } from './auth-admin.guards.service';

describe('AuthAdminGuardsService', () => {
  let service: AuthAdminGuardsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthAdminGuardsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
