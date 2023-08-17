Sample Call:
```
curl --location 'localhost:3000/createSprite' \
--header 'Content-Type: application/json' \
--data '{
"imageUrls": [
"https://www.ford.com/cmslibs/content/dam/vdm_ford/live/en_us/ford/nameplate/mache/2023/collections/3_2/23_frd_mce_slt_rprd_rpro_280x121.png/jcr:content/renditions/cq5dam.web.1280.1280.png",
"https://www.ford.com/cmslibs/content/dam/vdm_ford/live/en_us/ford/nameplate/bronco/2024/collections/3_2/21_frd_bro_outb_2d_rpro_RCRD_280x121.png/jcr:content/renditions/cq5dam.web.1280.1280.png",
"https://www.ford.com/cmslibs/content/dam/vdm_ford/live/en_us/ford/nameplate/explorer/2023/collections/3-2/23_frd_epr_plt_stbl_rpro_280x121.png/jcr:content/renditions/cq5dam.web.1280.1280.png"
]
}