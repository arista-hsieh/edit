import { createApp } from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.0.9/vue.esm-browser.js';
import pagination from "./pagination.js"

let productModal = null;
let delProductModal = null;

const app = createApp({
  components:{
    pagination
  },
  data() {
    return {
      apiUrl: 'https://vue3-course-api.hexschool.io/v2',
      apiPath: 'arista',
      products: [],
      isNew: false,
      pagination:{},
      tempProduct: {
        imagesUrl: [],
      },
    }
  },
  mounted() {
    productModal = new bootstrap.Modal(document.getElementById('productModal'), {
      keyboard: false
    });

    delProductModal = new bootstrap.Modal(document.getElementById('delProductModal'), {
      keyboard: false
    });

    // 取出 Token
    const token = document.cookie.replace(/(?:(?:^|.*;\s*)hexToken\s*=\s*([^;]*).*$)|^.*$/, '$1');
    axios.defaults.headers.common.Authorization = token;

    this.checkAdmin();//確認登入狀態
  },
  methods: {
    checkAdmin() {
      const url = `${this.apiUrl}/api/user/check`;
      axios.post(url)
        .then(() => {
          this.getData(); //取得產品列表
        })
        .catch((err) => {
          alert(err.data.message)
          window.location = 'index.html';
        })
    },
    getData(page = 1) { //取得所有產品列表
      const url = `${this.apiUrl}/api/${this.apiPath}/admin/products/?page=${page}`;
      axios.get(url).then((response) => {
        this.products = response.data.products;
        this.pagination = response.data.pagination;
      }).catch((err) => {
        alert(err.data.message);
      })
    },
    
    openModal(isNew, item) {
      if (isNew === 'new') { //如果isNew狀態為新增,則this.tepmProduct={imagesUrl:[],};
        this.tempProduct = {
          imagesUrl: [],
        };
        this.isNew = true;
        productModal.show();
      } else if (isNew === 'edit') {
        this.tempProduct = { ...item };
        this.isNew = false;
        productModal.show();
      } else if (isNew === 'delete') {
        this.tempProduct = { ...item };
        delProductModal.show()
      }
    },
    
    createImages() {
      this.tempProduct.imagesUrl = [];
      this.tempProduct.imagesUrl.push('');
    },
  },
});

app.component('productModal',{
  data(){
    return{
      apiUrl: 'https://vue3-course-api.hexschool.io/v2',
      apiPath: 'arista',
    }
  },
  props:['tempProduct','isNew'],
  template:'#templateForProductModal',
  methods:{
    updateProduct() { //更新產品
      let url = `${this.apiUrl}/api/${this.apiPath}/admin/product`; //如果沒有產品就新增
      let http = 'post';

      if (!this.isNew) {  //如果有產品就變更
        url = `${this.apiUrl}/api/${this.apiPath}/admin/product/${this.tempProduct.id}`;
        http = 'put'
      }

      axios[http](url, { data: this.tempProduct }).then((response) => {
        alert(response.data.message);
        productModal.hide();
        this.$emit('get-data')
        //this.getData();  //重新渲染產品列表
      }).catch((err) => {
        alert(err.data.message);
      })
    },
  }
});

app.component('delProductModal', {
  template: '#delProductModal',
  props: ['item'],
  data() {
    return {
      apiUrl: 'https://vue3-course-api.hexschool.io/v2',
      apiPath: 'arista',
      modal: null,
    };
  },
  mounted() {
    delProductModal = new bootstrap.Modal(document.getElementById('delProductModal'), {
      keyboard: false,
      backdrop: 'static',
    });
  },
  methods: {
    delProduct() {
      axios.delete(`${this.apiUrl}/api/${this.apiPath}/admin/product/${this.item.id}`).then((response) => {
        this.hideModal();
        this.$emit('update');
      }).catch((error) => {
        alert(error.data.message);
      });
    },
    openModal() {
      delProductModal.show();
    },
    hideModal() {
      delProductModal.hide();
    },
  },
});

app.mount('#app');