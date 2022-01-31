import { ComponentFixture, TestBed } from "@angular/core/testing";

import { WebComponent } from "./web.component";

describe("WebComponent", () => {
  let component: WebComponent;
  let fixture: ComponentFixture<WebComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WebComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WebComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
