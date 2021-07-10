<template>

 <v-card tile elevation="2" :to="{name: 'Project', params: { id: project._id}}">
     <v-img src="../assets/imgs/generic-img-500x500.jpg" height="150px" >

     </v-img>
             <!-- <v-btn text fab :to="{name: 'Project', params: { id: project._id}}">
          <v-icon>mdi-home</v-icon> 
        </v-btn> -->
     <v-card-title  class="text-subtitle-1 font-weight-medium text-capitalize text-truncate">
         {{ project.name }}
     </v-card-title>

     <!-- <v-card-subtitle>
             {{ project.description }}
         </v-card-subtitle> -->
     <v-card-actions>

         <v-tooltip bottom light>
             <template v-slot:activator="{ on, attrs }">
                 <v-icon v-bind="attrs" v-on="on">mdi-account-multiple</v-icon>
             </template>
             <span>Shared</span>
         </v-tooltip>

         <v-tooltip bottom light>
             <template v-slot:activator="{ on, attrs }">
                 <v-icon v-bind="attrs" v-on="on">mdi-eye</v-icon>
             </template>
             <span>Public</span>
         </v-tooltip>


         <v-spacer></v-spacer>
         <v-menu bottom left>
             <template v-slot:activator="{ on, attrs }">
                 <v-btn icon v-bind="attrs" v-on="on">
                     <v-icon>mdi-dots-vertical</v-icon>
                 </v-btn>
             </template>
             <v-list>
                 <v-list-item v-for="(item, i) in actions" :key="i" @click="item.action">
                     <v-list-item-icon>
            <v-icon v-text="item.icon"></v-icon>
          </v-list-item-icon>
                     <v-list-item-title>{{ item.title }}</v-list-item-title>
                 </v-list-item>
             </v-list>
         </v-menu>

     </v-card-actions>
 </v-card>

</template>

<script>
export default {
    props: ["project"],
    data() {
        return {
            actions: [{
                    title: 'Edit', icon: 'mdi-playlist-edit', action: this.edit  
                },
                {
                    title: 'Delete', icon: 'mdi-trash-can-outline', action: this.delete  
                }
            ]
        }
    },
    methods: {
    edit() {
        alert('edit project!');
    },
    delete() {
        alert('delete project!');
    },
  }
}
</script>