import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';

import { ProductService } from '../../shared/services';
import { Router } from '@angular/router';
import { Message, MessageService } from 'primeng/api';
import { PrimeNGConfig } from 'primeng/api';
import { CommonConstants } from 'src/app/shared/constants/common.constants';

@Component({
  selector: 'app-sales-records',
  templateUrl: './sales-records.component.html',
  styleUrls: ['./sales-records.component.scss'],
  providers: [MessageService]
})

export class SalesRecordsComponent implements OnInit {

  messages: Message[];

  displayModal: boolean;
  sales = [];
  columns = [];
  loading = false;

  searchValue = '';
  searchData = [];

  editSale = CommonConstants.SalesRowValueDefault;
  editSaleBckp = CommonConstants.SalesRowValueDefault;

  editSaleProductID = 0;

  constructor(
    private productService: ProductService,
    private router: Router,
    private primengConfig: PrimeNGConfig
  ) {
  }

  ngOnInit(): void {
    this.loadSalesData();
    this.primengConfig.ripple = true;
  }

  loadSalesData() {
    this.loading = true;

    /** get all products from the server */
    this.productService.getProducts()
      .pipe(first())
      .subscribe(response => {
        this.sales = response.data;
        this.searchData = response.data;
        this.columns = response.columns;
        this.loading = false;
      });
  }

  getTotalSales(rowVal) {
    let totalVal = 0
    if (rowVal && Object.keys(rowVal)) {
      Object.keys(rowVal).forEach((val) => {
        if (val.indexOf('sales') > -1) {
          totalVal += parseInt(rowVal[val], 10);
        }
      });
    }

    return totalVal;
  }

  isInt(value: string) {
    const x = parseFloat(value);
    return (x | 0) === x;
  }

  sortTable(colField) {
    let searchBy = '';
    let searchOrder = '';
    if (colField) {
      /** search in headers */
      if (this.columns && this.columns.length) {
        this.columns.forEach((col, idx) => {
          if (col.field === colField) {
            if (!col.sort) {
              this.columns[idx].sort = 'asc';
              this.columns[idx].sortClass = 'pi-sort-amount-up-alt';
            } else {
              if (col.sort === 'asc') {
                this.columns[idx].sort = 'desc';
                this.columns[idx].sortClass = 'pi-sort-amount-down';
              } else {
                this.columns[idx].sort = 'asc';
                this.columns[idx].sortClass = 'pi-sort-amount-up-alt';
              }
            }

            searchBy = colField;
            searchOrder = this.columns[idx].sort;
          } else {
            /** search in subheaders if exists */
            if (col.subHeaders && col.subHeaders.length) {
              col.subHeaders.forEach((sub, idx1) => {
                if (sub.field === colField) {
                  if (!sub.sort) {
                    this.columns[idx].subHeaders[idx1].sort = 'asc';
                    this.columns[idx].subHeaders[idx1].sortClass = 'pi-sort-amount-up-alt';
                  } else {
                    if (sub.sort === 'asc') {
                      this.columns[idx].subHeaders[idx1].sort = 'desc';
                      this.columns[idx].subHeaders[idx1].sortClass = 'pi-sort-amount-down';
                    } else {
                      this.columns[idx].subHeaders[idx1].sort = 'asc';
                      this.columns[idx].subHeaders[idx1].sortClass = 'pi-sort-amount-up-alt';
                    }
                  }

                  searchBy = colField;
                  searchOrder = this.columns[idx].subHeaders[idx1].sort;
                } else {
                  this.columns[idx].subHeaders[idx1].sort = '';
                  this.columns[idx].subHeaders[idx1].sortClass = '';
                }
              });
            } else {
              this.columns[idx].sort = '';
              this.columns[idx].sortClass = '';
            }
          }
        });
      }
    } else {
      /** means that we are on total */
      if (!this.columns[this.columns.length - 1].sort) {
        this.columns[this.columns.length - 1].sort = 'asc';
        this.columns[this.columns.length - 1].sortClass = 'pi-sort-amount-up-alt';
      } else {
        if (this.columns[this.columns.length - 1].sort === 'asc') {
          this.columns[this.columns.length - 1].sort = 'desc';
          this.columns[this.columns.length - 1].sortClass = 'pi-sort-amount-down';
        } else {
          this.columns[this.columns.length - 1].sort = 'asc';
          this.columns[this.columns.length - 1].sortClass = 'pi-sort-amount-up-alt';
        }
      }

      searchBy = colField;
      searchOrder = this.columns[this.columns.length - 1].sort;
    }


    if (searchBy && searchOrder) {
      if (searchOrder === 'asc') {
        this.sales.sort((a, b) => 0 - (a[searchBy] > b[searchBy] ? -1 : 1));
      } else {
        this.sales.sort((a, b) => 0 - (b[searchBy] > a[searchBy] ? -1 : 1));
      }
    }


    if (!searchBy && searchOrder) {
      /** we are in total because for this one we dont have colField. */
      if (searchOrder === 'asc') {
        this.sales.sort((a, b) => 0 - (this.getTotalSales(a) > this.getTotalSales(b) ? -1 : 1));
      } else {
        this.sales.sort((a, b) => 0 - (this.getTotalSales(b) > this.getTotalSales(a) ? -1 : 1));
      }
    }
  }

  /**
   * Global search for a string inside the sales data object
   * return all the sales where we found the searched string
   */
  onSalesSearch() {
    const filteredData = []
    if (this.searchValue && this.searchData && this.searchData.length) {
      this.searchData.forEach((sale) => {
        if (sale && Object.values(sale).length) {
          const recordFound = Object.values(sale).filter((val, key) => {
            const saleVal = '' + val;
            if (saleVal.toLowerCase().indexOf(this.searchValue) > -1) {
              return true;
            }

            return false;
          });

          if (recordFound && recordFound.length) {
            filteredData.push(sale);
          }
        }
      });
    }

    this.sales = filteredData;
  }

  resetSalesSearchForm() {
    this.sales = this.searchData;
    this.searchValue = '';
  }

  editSalesRowData(sale) {
    this.displayModal = true;
    this.editSaleProductID = sale.productID;
    this.editSale = sale;
    this.editSaleBckp = {
      ...sale
    };
  }

  updateSalesRowData() {
    if (this.editSale) {
      if (this.editSale.productName.length > CommonConstants.PRODUCT_NAME_LENGTH) {
        this.messages = [{ severity: 'error', summary: 'Product name length is not valid!' }];
        return;
      }

      if (this.editSale.productID.toString().length > CommonConstants.PRODUCT_ID_LENGTH) {
        this.messages = [{ severity: 'error', summary: 'Product ID length is not valid!' }];
        return;
      }

      this.loading = true;
      this.productService.update(this.editSale)
        .pipe(first())
        .subscribe(
          data => {
            this.searchData = data.data;
            this.sales = data.data;
            this.messages = [{ severity: 'success', summary: 'Data updated successfully!' }];
          },
          error => {
            this.messages = [{ severity: 'error', summary: 'Something went wrong, please try after sometime!' }];
          });

      this.loading = false;
      this.resetEditSale();
    }
  }

  /**
   * to track which items have been added or destroyed
   */
  trackByIndex(index: any, item: any) {
    return index;
  }

  cancelUpdateSaleRow(rowIndex) {
    this.resetEditSale();
    this.searchData[rowIndex] = this.editSaleBckp;
  }

  resetEditSale() {
    this.editSale = CommonConstants.SalesRowValueDefault;
  }
}
