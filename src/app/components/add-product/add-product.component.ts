import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from 'src/app/shared/services/product.service';
import { Message, MessageService, PrimeNGConfig } from 'primeng/api';
import { CommonConstants } from '../../shared/constants/common.constants';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.scss'],
  providers: [MessageService],
})
export class AddProductComponent implements OnInit {
  newProductForm: FormGroup;
  loading = false;
  messages: Message[];

  constructor(
    private router: Router,
    private productService: ProductService,
    private primengConfig: PrimeNGConfig
  ) { }

  ngOnInit(): void {
    this.primengConfig.ripple = true;

    this.newProductForm = new FormGroup({
      name: new FormControl('', [
        Validators.required,
        Validators.maxLength(CommonConstants.PRODUCT_NAME_LENGTH),
      ]),
      id: new FormControl('', [Validators.required, Validators.maxLength(CommonConstants.PRODUCT_ID_LENGTH)]),
      manager: new FormControl('', [Validators.maxLength(CommonConstants.PRODUCT_MANAGER_LENGTH)]),
      startdate: new FormControl('', [Validators.required]),
    });
  }

  onSubmit() {
    // reset alerts on submit
    this.messages = [];

    // stop here if form is invalid
    if (this.newProductForm.invalid) {
      return;
    }

    this.loading = true;
    /** add products inside the fake api server **/
    this.productService
      .addProduct({
        productId: this.newProductForm.controls.id.value,
        productName: this.newProductForm.controls.name.value,
        manager: this.newProductForm.controls.manager.value,
        productStartDate: this.newProductForm.controls.startdate.value,
      })
      .subscribe(
        (data) => {
          this.loading = false;
          this.messages = [
            { severity: 'success', summary: 'Successfully added the product' },
          ];
          this.router.navigate(['/sales-records']);
        },
        (error) => {
          this.messages = [
            {
              severity: 'error',
              summary: 'Something went wrong, please try after sometime!',
            },
          ];
          this.loading = false;
        }
      );
  }

  resetForm() {
    this.newProductForm.reset();
  }
}
